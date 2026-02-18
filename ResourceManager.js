class ResourceManager {
    getLevelDefinition(index) {
        return {
            startPosition: { x: 200, y: 300 },
            spaces: [
                {
                    id: 'space_0',
                    bounds: { x: 0, y: 0, width: 2560, height: 600 },
                    color: '#2c3e50'
                },
                {
                    id: 'space_1',
                    bounds: { x: 2560, y: 0, width: 2560, height: 600 },
                    color: '#1a5276'
                }
            ],
            zones: [
                {
                    id: 'exit_space_0',
                    x: 2520, y: 0, width: 40, height: 600,
                    type: 'spaceTransition',
                    targetSpaceIndex: 1
                }
            ]
        };
    }
}

export default ResourceManager;
