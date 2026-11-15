"""Keeptrip 상단 메뉴에 keep121.co.kr 로 이동하는 아이콘 링크 추가."""
from pathlib import Path

C = Path(__file__).resolve().parent.parent / "src" / "components"

(C / "Keep121Link.tsx").write_text('''import React from 'react';
import { Home } from 'lucide-react';

export const KEEP121_URL = 'https://keep121.co.kr/';

export const Keep121Link: React.FC<{ className?: string }> = ({ className = '' }) => (
  <a
    href={KEEP121_URL}
    className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-[#1E2856] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors ${className}`}
    aria-label="Keep121 홈으로 이동"
    title="Keep121 홈"
  >
    <Home className="w-4 h-4" />
    <span>Keep121</span>
  </a>
);
''', encoding="utf-8")

def patch(name, old, new, imp_after):
    p = C / name
    s = p.read_text(encoding="utf-8")
    if "Keep121Link" in s:
        return
    assert s.count(old) == 1, name
    s = s.replace(old, new)
    s = s.replace(imp_after, imp_after + "\nimport { Keep121Link } from './Keep121Link';", 1)
    p.write_text(s, encoding="utf-8")

# 모바일 메뉴(드로어) 상단: 로고 | Keep121 · 닫기
patch("MenuDrawer.tsx",
'''              <KeepTripLogo size="md" />
            </button>
            <button
              onClick={onClose}''',
'''              <KeepTripLogo size="md" />
            </button>
            <div className="flex items-center gap-1.5">
            <Keep121Link />
            <button
              onClick={onClose}''',
"import { KeepTripLogo } from './KeepTripLogo';")
p = C / "MenuDrawer.tsx"; s = p.read_text(encoding="utf-8")
old_close = '''              <X className="w-6 h-6 stroke-[2]" />
            </button>
          </div>'''
if "            </div>\n          </div>" not in s.split("<FontSizeControl")[0]:
  p.write_text(s.replace(old_close, '''              <X className="w-6 h-6 stroke-[2]" />
            </button>
            </div>
          </div>'''), encoding="utf-8")

# PC 상단바: Keep121 | 로고 | 일정 선택
patch("DesktopNav.tsx",
'''          <div className="flex items-center gap-2.5 lg:gap-4 shrink-0">
            <button onClick={onGoHome}''',
'''          <div className="flex items-center gap-2.5 lg:gap-4 shrink-0">
            <Keep121Link />
            <button onClick={onGoHome}''',
"import { KeepTripLogo } from './KeepTripLogo';")

# 첫 화면(모바일) 로고 옆
patch("TripHome.tsx",
'''          <KeepTripLogo size="md" className="md:hidden mb-3" />''',
'''          <div className="md:hidden mb-3 flex items-center justify-between gap-2">
            <KeepTripLogo size="md" />
            <Keep121Link />
          </div>''',
"import { KeepTripLogo } from './KeepTripLogo';")
# 첫 화면(PC) 우측 버튼 그룹 맨 앞
p = C / "TripHome.tsx"; s = p.read_text(encoding="utf-8")
old = """        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <FontSizeControl />"""
if "md:block\"><Keep121Link" not in s:
    assert s.count(old) == 1
    p.write_text(s.replace(old, old.replace("<FontSizeControl />", '<span className="hidden md:block"><Keep121Link /></span>\n        <FontSizeControl />')), encoding="utf-8")
print("ok")
