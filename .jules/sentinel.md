## 2024-07-27 - CR Carriage Return Bypass in Python Code Validation
**Vulnerability:** The stripPythonCommentsAndStrings function failed to correctly process carriage returns (\r).
**Learning:** Code execution bypass was possible because the comment stripping logic only looked for \n, leaving subsequent code on the same physical line hidden from the validator but executable by the Python engine.
**Prevention:** Always check for both \n and \r (or \r\n) when processing line terminators in text parsers.
