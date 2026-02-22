# simple-platformer

## How to run
**Android:** You can use Acode, then run `index.html`  
**PC:** Run `python -m http.server 8080` from the root directory, then open `http://localhost:8080` in your browser  


---

## Architecture

### Class interactions

```mermaid
graph LR
    subgraph init["Init"]
        main1["main.js"] -->|new| EM1["EventManager"]
        main1 -->|new| GU1["GravityUnit"]
        main1 -->|new| CU1["CollisionUnit"]
        GU1 -->|uses| EM1
        CU1 -->|uses| EM1
        main1 -->|new + pass EM1, GU1, CU1| LM1["LevelManager"]
        LM1 -->|new| PCM1["PlayerCameraMovement"]
        LM1 -->|new| CZT1["CameraZoneTrigger"]
        LM1 -->|new + pass EM1, GU1, CU1| SM1["SpaceManager"]
        SM1 -->|new| LSL1["LevelSpaceLoader"]
        LSL1 -->|"new (called in _fetchSpace)"| SL1["SpaceLevel"]
        SL1 -->|"new (called in _buildGrid)"| BL1["Block"]
    end
```

```mermaid
graph LR
    subgraph load["Load Level"]
        LM2["LevelManager"] -->|fetch level_n.json| JSON2["level_n.json"]
        JSON2 -->|defines spaces + zones| LM2
        LM2 -->|calculate worldX, resolve zone coordinates| LM2
        LM2 -->|activate space_n| SM2["SpaceManager"]
        SM2 -->|load space| LSL2["LevelSpaceLoader"]
        LSL2 -->|create + init| SL2["SpaceLevel"]
        SL2 -->|build grid of| BL2["Block"]
        SL2 -->|populates registeredBlocks| SL2
        SM2 -->|reads registeredBlocks| SL2
        SM2 -->|emit space:activated| EM2["EventManager"]
        SM2 -->|registerStatic| CU2["CollisionUnit"]
        SM2 -->|registerDynamic| CU2
        SM2 -->|register| GU2["GravityUnit"]
        LM2 -->|setSpaceLevel| PCM2["PlayerCameraMovement"]
        LM2 -->|setContext + registerZones| CZT2["CameraZoneTrigger"]
    end
```

```mermaid
graph LR
    subgraph loop["Game Loop"]
        main3["main.js"] -->|update| PL3["Player"]
        main3 -->|update| GU3["GravityUnit"]
        GU3 -->|emit gravity:apply| EM3["EventManager"]
        EM3 -->|gravity:apply| PL3
        main3 -->|update| CU3["CollisionUnit"]
        CU3 -->|emit collision:detected| EM3
        EM3 -->|collision:detected| PL3
        main3 -->|update + render| LM3["LevelManager"]
        LM3 -->|check player| CZT3["CameraZoneTrigger"]
        CZT3 -->|emit: scrollStart/scrollEnd, zoneEnter/zoneExit| LM3
        LM3 -->|onScrollStart/onScrollEnd| PCM3["PlayerCameraMovement"]
        LM3 -->|getOffset| PCM3
        LM3 -->|update player position on zoneEnter| PL3
        LM3 -->|render spaces| SL3["SpaceLevel"]
        SL3 -->|render blocks| BL3["Block"]
        LM3 -->|render player| PL3
    end
```
