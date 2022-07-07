
; https://en.wikipedia.org/wiki/Indentation_style#Brace_placement_in_compound_statements
Allman()
{
    return "Allman"
}

KAndR() {
    return "KandR"
}


; Variadic Functions 
/**
 * @param {char} sep
 * @param {List}
 */
; Join(sep, params*) {
;     for index,param in params
;         str .= param . sep
;     return SubStr(str, 1, -StrLen(sep))
; }

; MsgBox % Join("`n", "one", "two", "three")
