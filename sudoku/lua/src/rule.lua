logicpt.logic.v1.register()

---@alias Rule<T> { data: T }

---@alias RuleData { cells: integer[] }


---@type Rule<RuleData>
local ttt

ttt = { data = { cells = {} } }


---@overload fun(x: "A"): "B"
---@overload fun(x: "B"): "B"
---@overload fun(x: "C"): "C"
---@overload fun(x: "D"): "D"
---@overload fun(x: "E"): "E"
---@overload fun(x: "F"): "F"
---@overload fun(x: "G"): "G"
---@overload fun(x: "H"): "H"
local function f1(x) end


local y = f1("E")

--[[

Rule extends Deduction

string rule_name
string rule_description


Deduction

string deduction_name
table Data
...


LogicStep

string name
function explain() -> Explanation
function match() -> Some Metric and Closeness Suggestions
function deduct(context) -> (Deduction, Explanation)[]
...


also


add ability to add custom descriptions for rule combos
this would be done in another file

]]--
