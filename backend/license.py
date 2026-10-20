import json
import os
import time
import threading
import requests

_config_mutex = threading.Lock()
_config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')

_default_config = {
    'license_entries': [],
    'ai_providers': [],
}


def _load_config():
    try:
        with open(_config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return dict(_default_config)


def _save_config(cfg):
    with open(_config_path, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)


def load_config_for_api():
    with _config_mutex:
        cfg = _load_config()
        entries = [{'name': e['name']} for e in cfg.get('license_entries', [])]
        return {
            'license_entries': entries,
            'ai_providers': cfg.get('ai_providers', []),
        }


def save_license_entries(entries):
    from encrypt import encrypt
    with _config_mutex:
        cfg = _load_config()
        existing_keys = {e['name']: e.get('key', '') for e in cfg.get('license_entries', [])}
        result = []
        for e in entries:
            name = e.get('name', '')
            if not name:
                continue
            key = e.get('key', '')
            if not key:
                if name in existing_keys and existing_keys[name]:
                    key = existing_keys[name]
                else:
                    continue
            else:
                key = encrypt(key)
            result.append({'name': name, 'key': key, 'encrypted': True})
        cfg['license_entries'] = result
        if entries and entries[0].get('key'):
            cfg['unidoc_license_key'] = entries[0]['key']
        _save_config(cfg)


def save_ai_providers(providers):
    with _config_mutex:
        cfg = _load_config()
        cfg['ai_providers'] = providers
        _save_config(cfg)


def _get_default_base_url(provider):
    urls = {
        '阿里云': 'https://dashscope.aliyuncs.com/compatible-mode',
        '智谱': 'https://open.bigmodel.cn/api/paas/v4',
        'DeepSeek': 'https://api.deepseek.com',
        'Moonshot': 'https://api.moonshot.cn/v1',
        '零一万物': 'https://api.lingyiwanwu.com/v1',
        'OpenAI': 'https://api.openai.com/v1',
        'Anthropic': 'https://api.anthropic.com/v1',
        'Google': 'https://generativelanguage.googleapis.com/v1beta',
        'Mistral': 'https://api.mistral.ai/v1',
        'Groq': 'https://api.groq.com/openai/v1',
    }
    return urls.get(provider, provider)


def _trim_endpoint_suffix(ep):
    if ep.endswith('/chat/completions'):
        return ep[:-len('/chat/completions')]
    if ep.endswith('/messages'):
        return ep[:-len('/messages')]
    return ep


def _test_models_endpoint(base_url, api_key):
    models_url = _trim_endpoint_suffix(base_url) + '/models'
    try:
        resp = requests.get(models_url, headers={'Authorization': 'Bearer ' + api_key}, timeout=8)
    except Exception as e:
        return {'available': False, 'error': 'connection failed: %s' % e}
    if resp.status_code == 200:
        return {'available': True}
    elif resp.status_code in (401, 403):
        return {'available': False, 'error': 'API key invalid'}
    elif resp.status_code == 404:
        return _test_chat_completions(_trim_endpoint_suffix(base_url), api_key, '')
    else:
        return {'available': False, 'error': 'unexpected status %d' % resp.status_code}


def _test_chat_completions(base_url, api_key, model):
    is_anthropic = str(model).lower() == 'anthropic'
    messages_url = base_url + ('/messages' if is_anthropic else '/chat/completions')
    payload = {'model': model, 'messages': [{'role': 'user', 'content': 'Hi'}]}
    if is_anthropic:
        payload['max_tokens'] = 1
    try:
        headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api_key}
        if is_anthropic:
            headers['x-api-key'] = api_key
            headers['anthropic-version'] = '2023-06-01'
        resp = requests.post(messages_url, json=payload, headers=headers, timeout=8)
    except Exception as e:
        return {'available': False, 'error': 'connection failed: %s' % e}
    if resp.status_code == 200:
        return {'available': True}
    elif resp.status_code in (401, 403):
        return {'available': False, 'error': 'API key invalid'}
    else:
        body = resp.text[:200]
        return {'available': False, 'error': 'status %d: %s' % (resp.status_code, body)}


def test_api_key(provider, api_key, model, custom_endpoint, custom_format):
    if custom_endpoint:
        return _test_custom_endpoint(custom_endpoint, api_key, model, custom_format)
    base_url = _get_default_base_url(provider)
    return _test_models_endpoint(base_url, api_key)


def _test_custom_endpoint(endpoint, api_key, model, custom_format):
    normalized = _trim_endpoint_suffix(endpoint)
    return _test_models_endpoint(normalized, api_key)
