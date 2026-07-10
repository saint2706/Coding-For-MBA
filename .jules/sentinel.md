## 2024-07-10 - Regex bypass in Python comment stripping
**Vulnerability:** Python code validation could be bypassed using a carriage return (`\r`) inside comments.
**Learning:** The previous comment stripper only stopped at `\n`, allowing code on the same line after a `\r` to be ignored by the validator but executed by the Python runtime.
**Prevention:** Always check for both `\r` and `\n` when manually parsing line-ending boundaries.
