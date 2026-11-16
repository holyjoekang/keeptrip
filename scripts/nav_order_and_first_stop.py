"""하단·상단 메뉴: 준비 → 일정(구 '오늘') 순서, 일정 화면 기본은 첫 일정."""
import re
from pathlib import Path
C = Path(__file__).resolve().parent.parent / "src" / "components"

def swap(path, a_start, b_start, b_end):
    """[a_start, b_start) 블록과 [b_start, b_end) 블록 순서를 바꾼다(이미 바뀌었으면 건너뜀)."""
    p = C / path; s = p.read_text(encoding="utf-8")
    if a_start not in s:
        return
    i, j = s.index(a_start), s.index(b_start)
    if j < i:
        return
    k = s.index(b_end, j)
    p.write_text(s[:i] + s[j:k] + s[i:j] + s[k:], encoding="utf-8")

# 모바일 하단
swap("BottomNav.tsx", "          {/* 오늘 */}", "          {/* 준비 */}", "          {/* 기록 */}")
p = C / "BottomNav.tsx"; s = p.read_text(encoding="utf-8")
s = s.replace("{/* 오늘 */}", "{/* 일정 */}").replace("""              오늘
            </span>""", """              일정
            </span>""")
p.write_text(s, encoding="utf-8")

# PC 상단
swap("DesktopNav.tsx", "            <button\n              onClick={() => onTabChange('today')}",
     "            <button\n              onClick={() => onTabChange('prep')}",
     "            <button\n              onClick={() => onTabChange('record')}")
p = C / "DesktopNav.tsx"; s = p.read_text(encoding="utf-8")
s = s.replace('<span className="md:inline lg:hidden">오늘</span>', '<span className="md:inline lg:hidden">일정</span>')
s = s.replace('<span className="hidden lg:inline">오늘의 일정</span>', '<span className="hidden lg:inline">일정</span>')
p.write_text(s, encoding="utf-8")

# 일정 화면: 여행 중 현재 시각이 아니면 그 날의 첫 일정
p = C / "TodayScreen.tsx"; s = p.read_text(encoding="utf-8")
s = s.replace(": activeDay.stops.find((s) => s.docent) || activeDay.stops[2] || activeDay.stops[0];",
              ": activeDay.stops[0];")
p.write_text(s, encoding="utf-8")
print("ok")
