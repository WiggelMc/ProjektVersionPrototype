local puzzle = logicpt.puzzle.v1.create_puzzle("puzzle 1")

local version_lock = logicpt.puzzle.v1.create_version_lock {
    isTemporary = true,
    useGlobalKey = true
}

version_lock:lock("v1")

puzzle.build()

version_lock:unlock()
