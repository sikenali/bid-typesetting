import json
import os
import shutil
import tempfile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from docx import Document
from pipeline import run_pipeline
from license import load_config_for_api, save_license_entries, save_ai_providers, test_api_key

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024

MAX_FILE_SIZE = 150 * 1024 * 1024


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/api/format', methods=['POST'])
def format_document():
    config_raw = request.form.get('config', '')
    if not config_raw:
        return jsonify({'error': 'missing config field'}), 400

    try:
        cfg = json.loads(config_raw)
    except json.JSONDecodeError as e:
        return jsonify({'error': 'invalid config JSON: %s' % str(e)}), 400

    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'missing file field'}), 400

    ext = os.path.splitext(file.filename or '')[1]
    if ext != '.docx':
        return jsonify({'error': 'only .docx files are accepted'}), 400

    tmp_dir = tempfile.mkdtemp(prefix='bid-format-')
    try:
        in_path = os.path.join(tmp_dir, 'input.docx')
        out_path = os.path.join(tmp_dir, 'output.docx')

        with open(in_path, 'wb') as f:
            shutil.copyfileobj(file, f)

        doc = Document(in_path)
        run_pipeline(doc, cfg)
        doc.save(out_path)

        return send_file(out_path, as_attachment=True, download_name='formatted.docx',
                         mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify(load_config_for_api())


@app.route('/api/config', methods=['PUT'])
def update_config():
    data = request.get_json(silent=True) or {}
    if 'license_entries' in data and data['license_entries'] is not None:
        try:
            save_license_entries(data['license_entries'])
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    if 'ai_providers' in data:
        try:
            save_ai_providers(data['ai_providers'])
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return jsonify({'status': 'ok'})


@app.route('/api/config/test-key', methods=['POST'])
def test_key():
    data = request.get_json(silent=True) or {}
    provider = data.get('provider', '')
    api_key = data.get('key', '')
    model = data.get('model', '')
    endpoint = data.get('endpoint', '')
    fmt = data.get('format', '')
    result = test_api_key(provider, api_key, model, endpoint, fmt)
    return jsonify(result)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8099'))
    print('格式化服务已启动，端口: %d' % port, flush=True)
    app.run(host='0.0.0.0', port=port, debug=False)
