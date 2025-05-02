local puzzle = puzzpt.puzzle.v1.create_puzzle("puzzle 1")

local version_lock = puzzpt.puzzle.v1.create_version_lock {
    isTemporary = true,
    useGlobalKey = true
}

-- Maybe split into different classes,
-- TempLock .lock()
-- GlobalTempLock .lock(tag)
-- PuzzleLock .lock(hash?)
-- GlobalPuzzleLock .lock(tag)

version_lock:lock("v1")

puzzle:build()

version_lock:unlock()

--[[

Folder Structure:

.luarc.json
.puzzpt.json (config file, good for global folder and compile settings) (not required, but maybe a good idea)
    // puzzpt project build puzzle (uses project structure)
    // puzzpt build puzzle (uses file only)
.editorconfig
temp/
    locks/
        puzzle/
            puzzle.lock.json
        global/
            v1.lock.json
locks/
    puzzle/
        puzzle.lock.json (maybe next to puzzle file)
    global/
        v1.lock.json
puzzles/
    puzzle.lua

]] --
