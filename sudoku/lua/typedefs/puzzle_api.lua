---@meta

---@class LogicCpt
---@field puzzle PuzzleApi
logicpt = logicpt or {}

---@class PuzzleApi
---@field v1 PuzzleApiV1

---@class PuzzleApiV1
local v1 = {}

---@param id string
---@return Puzzle
function v1.create_puzzle(id)
    return {}
end

---@param param VersionLockParam
---@return VersionLock
function v1.create_version_lock(param) end

---@class VersionLock
local version_lock = {}


---@param key string
function version_lock:lock(key) end

function version_lock:unlock() end


---@class Puzzle
local puzzle = {}

function puzzle.build() end



---@class (exact) VersionLockParam
---@field isTemporary boolean
---@field useGlobalKey boolean
