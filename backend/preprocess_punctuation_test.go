package wordformat

import "testing"

func TestNormalizePunctHalfToFull(t *testing.T) {
	cases := []struct {
		name string
		in   string
		want string
	}{
		{"逗号句号", "行距过大,未缩进.", "行距过大，未缩进。"},
		{"千分位保留", "本段中文与English混排无空格,标点半角.", "本段中文与English混排无空格，标点半角。"},
		{"小数与百分比保留", "性能指标为99.9%以上,响应时间<50ms,满足要求.", "性能指标为99.9%以上，响应时间<50ms，满足要求。"},
		{"版本号保留", "兼容HTTP 1.1与v2.0协议.", "兼容HTTP 1.1与v2.0协议。"},
		{"分号冒号感叹问号", "注意;要求:必须!有疑问?", "注意；要求：必须！有疑问？"},
		{"括号", "投标人(以下简称投标人)提交材料", "投标人（以下简称投标人）提交材料"},
		{"引号成对", "他说\"你好\"然后离开", "他说“你好”然后离开"},
		{"纯英文不变", "Hello, world.", "Hello, world."},
		{"纯数字逗号不变", "总计1,000元的项目", "总计1,000元的项目"},
		{"已全角不变", "（中文）全角，标点。", "（中文）全角，标点。"},
	}
	for _, c := range cases {
		if got := normalizePunct(c.in); got != c.want {
			t.Errorf("%s: got %q want %q", c.name, got, c.want)
		}
	}
}
