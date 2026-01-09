// PKN Dev Tools - Full Featured Chrome Extension v2.1
(function() {
    // Toggle if already exists
    if (window.__devtools) {
        window.__devtools.toggle();
        return;
    }

    // ==========================================
    // SETTINGS & STORAGE
    // ==========================================
    const STORAGE_KEY = '__devtools_settings';
    const defaultSettings = {
        theme: {
            accent: '#00ffff',
            bg: 'rgba(15, 15, 20, 0.92)',
            text: '#e0e0e0'
        },
        panels: {}
    };

    let settings = { ...defaultSettings };
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) settings = { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {}

    const saveSettings = () => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
    };

    const accentRGB = (alpha = 1) => {
        const hex = settings.theme.accent.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Track modified elements for CSS export
    const modifiedElements = new Map();
    const styleHistory = []; // For undo
    let historyIndex = -1;

    // ==========================================
    // CREATE MAIN ELEMENT
    // ==========================================
    const d = document.createElement('div');
    d.id = '__devtools_main';

    const updateThemeCSS = () => {
        const accent = settings.theme.accent;
        const bg = settings.theme.bg;
        const text = settings.theme.text;

        d.querySelector('#__dt_theme_style').textContent = `
            .__dt_panel { background: ${bg}; color: ${text}; border-color: ${accentRGB(0.5)}; box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${accentRGB(0.15)}; }
            .__dt_header { background: ${accentRGB(0.1)}; border-bottom-color: ${accentRGB(0.3)}; }
            .__dt_title { color: ${accent}; text-shadow: 0 0 8px ${accentRGB(0.5)}; }
            .__dt_hbtn { color: ${accent}; }
            .__dt_hbtn:hover { background: ${accentRGB(0.3)}; }
            .__dt_hbtn.active { background: ${accentRGB(0.4)}; }
            .__dt_body::-webkit-scrollbar-thumb { background: ${accentRGB(0.4)}; }
            .__dt_resize { background: linear-gradient(90deg, transparent 30%, ${accentRGB(0.3)} 50%, transparent 70%); }
            .__dt_resize_c::after { border-color: ${accentRGB(0.5)}; }
            .__dt_label { color: ${accent}; }
            .__dt_btn { background: ${accentRGB(0.1)}; border-color: ${accentRGB(0.3)}; color: ${accent}; }
            .__dt_btn:hover { background: ${accentRGB(0.25)}; border-color: ${accent}; }
            .__dt_btn.active { background: ${accentRGB(0.3)}; }
            .__dt_input { border-color: ${accentRGB(0.3)}; }
            .__dt_input:focus { border-color: ${accent}; }
            .__dt_tool { border-color: ${accentRGB(0.3)}; background: ${accentRGB(0.05)}; color: ${accent}; }
            .__dt_tool:hover { background: ${accentRGB(0.15)}; border-color: ${accent}; box-shadow: 0 0 12px ${accentRGB(0.2)}; }
            #__dt_hover { border-color: ${accent}; background: ${accentRGB(0.1)}; }
            .__dt_range { background: ${accentRGB(0.2)}; }
            .__dt_range::-webkit-slider-thumb { background: ${accent}; }
            .__dt_val { color: ${accent}; }
            #__dt_snap_preview { background: ${accentRGB(0.15)}; border-color: ${accent}; }
            .__dt_kbd { background: ${accentRGB(0.2)}; border-color: ${accentRGB(0.4)}; color: ${accent}; }
        `;
    };

    d.innerHTML = `
        <style id="__dt_base_style">
            .__dt_panel {
                position: fixed;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 2px solid;
                border-radius: 12px;
                font-family: 'Courier New', monospace;
                z-index: 2147483647;
                font-size: 12px;
                min-width: 200px;
                display: flex;
                flex-direction: column;
            }
            .__dt_panel.transparent { background: rgba(0, 0, 0, 0.15) !important; backdrop-filter: none; }
            .__dt_panel.transparent .__dt_body { opacity: 0.3; }
            .__dt_panel.transparent:hover .__dt_body { opacity: 1; }
            .__dt_panel.minimized { height: auto !important; }
            .__dt_panel.minimized .__dt_body,
            .__dt_panel.minimized .__dt_resize,
            .__dt_panel.minimized .__dt_resize_r,
            .__dt_panel.minimized .__dt_resize_c { display: none; }
            .__dt_panel.minimized .__dt_header { border-radius: 10px; border-bottom: none; }
            .__dt_panel.hidden { display: none !important; }
            .__dt_panel * { box-sizing: border-box; margin: 0; padding: 0; }

            .__dt_header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                cursor: move;
                border-radius: 10px 10px 0 0;
                flex-shrink: 0;
                border-bottom: 1px solid;
            }
            .__dt_title { font-weight: bold; font-size: 12px; }
            .__dt_btns { display: flex; gap: 3px; }
            .__dt_hbtn {
                background: rgba(255,255,255,0.1);
                border: none;
                width: 20px;
                height: 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .__dt_hbtn.close:hover { background: rgba(255,68,68,0.5); color: white; }

            .__dt_body { padding: 12px; overflow-y: auto; flex: 1; min-height: 0; }
            .__dt_body::-webkit-scrollbar { width: 5px; }
            .__dt_body::-webkit-scrollbar-thumb { border-radius: 3px; }

            .__dt_resize { height: 8px; cursor: ns-resize; flex-shrink: 0; }
            .__dt_resize_r { position: absolute; right: 0; top: 35px; bottom: 8px; width: 8px; cursor: ew-resize; }
            .__dt_resize_c { position: absolute; right: 0; bottom: 0; width: 14px; height: 14px; cursor: se-resize; }
            .__dt_resize_c::after { content: ''; position: absolute; right: 3px; bottom: 3px; width: 6px; height: 6px; border-right: 2px solid; border-bottom: 2px solid; }

            .__dt_section { margin-bottom: 12px; }
            .__dt_label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
            .__dt_btn {
                width: 100%;
                padding: 8px;
                margin-bottom: 5px;
                border: 1px solid;
                border-radius: 5px;
                cursor: pointer;
                font-family: inherit;
                font-size: 11px;
                transition: all 0.15s;
            }
            .__dt_row { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
            .__dt_row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; }
            .__dt_info {
                background: rgba(0, 0, 0, 0.4);
                padding: 8px;
                border-radius: 5px;
                font-size: 10px;
                min-height: 40px;
                color: #888;
                line-height: 1.4;
            }
            .__dt_input {
                width: 100%;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid;
                color: #e0e0e0;
                padding: 6px 8px;
                border-radius: 4px;
                font-family: inherit;
                font-size: 11px;
            }
            .__dt_input:focus { outline: none; }

            .__dt_tool {
                padding: 10px 6px;
                border: 1px solid;
                border-radius: 8px;
                cursor: pointer;
                font-family: inherit;
                font-size: 9px;
                text-align: center;
                transition: all 0.2s;
                min-height: 60px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .__dt_tool_icon { font-size: 18px; display: block; margin-bottom: 3px; }
            .__dt_grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

            #__dt_hover { position: fixed; border: 2px dashed; pointer-events: none; z-index: 2147483646; display: none; }

            .__dt_clabel { font-size: 9px; color: #888; margin-bottom: 2px; }
            .__dt_color { height: 28px; padding: 2px; }

            .__dt_range { width: 100%; height: 4px; -webkit-appearance: none; border-radius: 2px; margin: 4px 0; }
            .__dt_range::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; cursor: pointer; }
            .__dt_val { font-size: 9px; text-align: right; }

            .__dt_kbd { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 10px; border: 1px solid; margin-left: 4px; }
            .__dt_shortcut { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 11px; color: #aaa; }

            #__dt_snap_preview { position: fixed; border: 2px dashed; display: none; z-index: 2147483645; pointer-events: none; transition: all 0.1s ease; }

            .__dt_preset { width: 24px; height: 24px; border-radius: 4px; border: 2px solid transparent; cursor: pointer; }
            .__dt_preset:hover { border-color: white; }
            .__dt_preset.active { border-color: white; box-shadow: 0 0 8px currentColor; }

            .__dt_net_item { padding: 6px 8px; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer; font-size: 10px; display: flex; gap: 8px; align-items: center; }
            .__dt_net_item:hover { background: rgba(255,255,255,0.05); }
            .__dt_net_item.error { color: #ff4444; }
            .__dt_net_item.pending { opacity: 0.6; }
            .__dt_net_method { font-weight: bold; min-width: 35px; }
            .__dt_net_status { min-width: 30px; text-align: center; padding: 1px 4px; border-radius: 3px; font-size: 9px; }
            .__dt_net_status.s2xx { background: rgba(0,255,0,0.2); color: #0f0; }
            .__dt_net_status.s3xx { background: rgba(0,255,255,0.2); color: #0ff; }
            .__dt_net_status.s4xx { background: rgba(255,165,0,0.2); color: #ffa500; }
            .__dt_net_status.s5xx { background: rgba(255,0,0,0.2); color: #f44; }
            .__dt_net_url { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #888; }
            .__dt_net_time { min-width: 45px; text-align: right; color: #666; }
            .__dt_net_size { min-width: 50px; text-align: right; color: #666; }
            .__dt_net_filter { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
            .__dt_net_filter_btn { padding: 3px 8px; font-size: 9px; border-radius: 3px; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #888; }
            .__dt_net_filter_btn:hover { border-color: rgba(255,255,255,0.4); }
            .__dt_net_filter_btn.active { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.4); }
            .__dt_net_detail { background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; font-size: 9px; margin-top: 8px; max-height: 150px; overflow-y: auto; word-break: break-all; }
            .__dt_net_detail_title { font-weight: bold; margin-bottom: 4px; }
            .__dt_net_header { display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(0,0,0,0.2); font-size: 9px; color: #666; border-bottom: 1px solid rgba(255,255,255,0.1); }
        </style>
        <style id="__dt_theme_style"></style>

        <!-- MAIN HUB PANEL -->
        <div class="__dt_panel" id="__dt_hub" style="top:20px;right:20px;width:240px;height:420px;">
            <div class="__dt_header">
                <span class="__dt_title">Dev Tools</span>
                <div class="__dt_btns">
                    <button class="__dt_hbtn __dt_transtoggle" title="Transparent">◐</button>
                    <button class="__dt_hbtn __dt_mintoggle" title="Minimize">−</button>
                    <button class="__dt_hbtn close __dt_closemain" title="Close (Esc)">×</button>
                </div>
            </div>
            <div class="__dt_body">
                <div class="__dt_section">
                    <div class="__dt_label">Tools</div>
                    <div class="__dt_grid">
                        <button class="__dt_tool" data-panel="__dt_inspector"><span class="__dt_tool_icon">🎯</span>Inspector</button>
                        <button class="__dt_tool" data-panel="__dt_styles"><span class="__dt_tool_icon">🎨</span>Styles</button>
                        <button class="__dt_tool" data-panel="__dt_console"><span class="__dt_tool_icon">🖥</span>Console</button>
                        <button class="__dt_tool" data-panel="__dt_elements"><span class="__dt_tool_icon">📦</span>Elements</button>
                        <button class="__dt_tool" data-panel="__dt_network"><span class="__dt_tool_icon">🌐</span>Network</button>
                        <button class="__dt_tool" data-panel="__dt_settings"><span class="__dt_tool_icon">⚙️</span>Settings</button>
                        <button class="__dt_tool" data-panel="__dt_shortcuts"><span class="__dt_tool_icon">⌨️</span>Shortcuts</button>
                    </div>
                </div>
                <div class="__dt_section">
                    <div class="__dt_label">Quick</div>
                    <div class="__dt_row">
                        <button class="__dt_btn" id="__dt_outlineall">Outline All</button>
                        <button class="__dt_btn" id="__dt_closeall">Close Panels</button>
                    </div>
                </div>
            </div>
            <div class="__dt_resize_r"></div>
            <div class="__dt_resize_c"></div>
            <div class="__dt_resize"></div>
        </div>

        <!-- INSPECTOR PANEL -->
        <div class="__dt_panel hidden" id="__dt_inspector" style="top:80px;left:20px;width:280px;height:340px;">
            <div class="__dt_header">
                <span class="__dt_title">Inspector</span>
                <div class="__dt_btns">
                    <button class="__dt_hbtn __dt_transtoggle">◐</button>
                    <button class="__dt_hbtn __dt_mintoggle">−</button>
                    <button class="__dt_hbtn close __dt_closepanel">×</button>
                </div>
            </div>
            <div class="__dt_body">
                <button class="__dt_btn" id="__dt_pick">👆 Pick Element <span class="__dt_kbd">P</span></button>
                <div class="__dt_section">
                    <div class="__dt_label">Selected</div>
                    <div class="__dt_info" id="__dt_info">Click "Pick Element" or press P</div>
                </div>
                <div class="__dt_section">
                    <div class="__dt_label">Actions</div>
                    <div class="__dt_row">
                        <button class="__dt_btn" id="__dt_hide">Hide</button>
                        <button class="__dt_btn" id="__dt_show">Show</button>
                    </div>
                    <div class="__dt_row">
                        <button class="__dt_btn" id="__dt_remove">Remove</button>
                        <button class="__dt_btn" id="__dt_copy">Copy HTML</button>
                    </div>
                    <button class="__dt_btn" id="__dt_copyselector">📋 Copy Selector</button>
                </div>
            </div>
            <div class="__dt_resize_r"></div>
            <div class="__dt_resize_c"></div>
            <div class="__dt_resize"></div>
        </div>

        <!-- STYLES PANEL -->
        <div class="__dt_panel hidden" id="__dt_styles" style="top:80px;left:320px;width:280px;height:480px;">
            <div class="__dt_header">
                <span class="__dt_title">Styles</span>
                <div class="__dt_btns">
                    <button class="__dt_hbtn __dt_transtoggle">◐</button>
                    <button class="__dt_hbtn __dt_mintoggle">−</button>
                    <button class="__dt_hbtn close __dt_closepanel">×</button>
                </div>
            </div>
            <div class="__dt_body">
                <div class="__dt_section">
                    <div class="__dt_label">Size</div>
                    <div class="__dt_clabel">Width</div>
                    <input type="range" class="__dt_range" id="__dt_width" min="0" max="800" value="0">
                    <div class="__dt_val" id="__dt_widthval">auto</div>
                    <div class="__dt_clabel">Height</div>
                    <input type="range" class="__dt_range" id="__dt_height" min="0" max="800" value="0">
                    <div class="__dt_val" id="__dt_heightval">auto</div>
                </div>
                <div class="__dt_section">
                    <div class="__dt_label">Spacing</div>
                    <div class="__dt_row">
                        <div>
                            <div class="__dt_clabel">Padding</div>
                            <input type="number" class="__dt_input" id="__dt_padding" value="0" min="0" max="100">
                        </div>
                        <div>
                            <div class="__dt_clabel">Margin</div>
                            <input type="number" class="__dt_input" id="__dt_margin" value="0" min="0" max="100">
                        </div>
                    </div>
                </div>
                <div class="__dt_section">
                    <div class="__dt_label">Colors</div>
                    <div class="__dt_row">
                        <div><div class="__dt_clabel">Background</div><input type="color" class="__dt_input __dt_color" id="__dt_bg" value="#111111"></div>
                        <div><div class="__dt_clabel">Text</div><input type="color" class="__dt_input __dt_color" id="__dt_fg" value="#00ffff"></div>
                    </div>
                </div>
                <div class="__dt_section">
                    <div class="__dt_label">Border</div>
                    <div class="__dt_row">
                        <div><div class="__dt_clabel">Color</div><input type="color" class="__dt_input __dt_color" id="__dt_border" value="#00ffff"></div>
                        <div><div class="__dt_clabel">Width</div><input type="number" class="__dt_input" id="__dt_borderw" value="0" min="0" max="20"></div>
                    </div>
                    <div class="__dt_clabel" style="margin-top:6px">Radius</div>
                    <input type="range" class="__dt_range" id="__dt_radius" min="0" max="50" value="0">
                    <div class="__dt_val" id="__dt_radiusval">0px</div>
                </div>
                <div class="__dt_section">
                    <div class="__dt_label">Effects</div>
                    <div class="__dt_clabel">Opacity</div>
                    <input type="range" class="__dt_range" id="__dt_opacity" min="0" max="100" value="100">
                    <div class="__dt_val" id="__dt_opacityval">100%</div>
                </div>
                <div class="__dt_row">
                    <button class="__dt_btn" id="__dt_undo">↩ Undo <span class="__dt_kbd">Z</span></button>
                    <button class="__dt_btn" id="__dt_export">📤 Export</button>
                </div>
            </div>
            <div class="__dt_resize_r"></div>
            <div class="__dt_resize_c"></div>
            <div class="__dt_resize"></div>
        </div>

        <!-- CONSOLE PANEL -->
        <div class="__dt_panel hidden" id="__dt_console" style="bottom:20px;left:20px;width:360px;height:220px;">
            <div class="__dt_header">
                <span class="__dt_title">Console</span>
                <div class="__dt_btns">
                    <button class="__dt_hbtn __dt_transtoggle">◐</button>
                    <button class="__dt_hbtn __dt_mintoggle">−</button>
                    <button class="__dt_hbtn close __dt_closepanel">×</button>
                </div>
            </div>
            <div class="__dt_body">
                <div class="__dt_info" id="__dt_logs" style="height:100px;overflow-y:auto;margin-bottom:8px;font-size:10px"></div>
                <input type="text" class="__dt_input" id="__dt_eval" placeholder="document.title">
                <div class="__dt_row" style="margin-top:6px">
                    <button class="__dt_btn" id="__dt_run">▶ Run</button>
                    <button class="__dt_btn" id="__dt_clear">Clear</button>
                </div>
            </div>
            <div class="__dt_resize_r"></div>
            <div class="__dt_resize_c"></div>
            <div class="__dt_resize"></div>
        </div>

        <!-- ELEMENTS PANEL -->
        <div class="__dt_panel hidden" id="__dt_elements" style="top:200px;right:280px;width:300px;height:260px;">
            <div class="__dt_header">
                <span class="__dt_title">Elements</span>
                <div class="__dt_btns">
                    <button class="__dt_hbtn __dt_transtoggle">◐</button>
                    <button class="__dt_hbtn __dt_mintoggle">−</button>
                    <button class="__dt_hbtn close __dt_closepanel">×</button>
                </div>
            </div>
            <div class="__dt_body">
                <input type="text" class="__dt_input" id="__dt_search" placeholder="#id, .class, tag">
                <button class="__dt_btn" id="__dt_searchbtn" style="margin-top:6px">🔍 Search</button>
                <div class="__dt_section" style="margin-top:10px">
                    <div class="__dt_label">Results</div>
                    <div class="__dt_info" id="__dt_results" style="height:100px;overflow-y:auto"></div>
                </div>
            </div>
            <div class="__dt_resize_r"></div>
            <div class="__dt_resize_c"></div>
            <div class="__dt_resize"></div>
        </div>

        <!-- SETTINGS PANEL -->
        <div class="__dt_panel hidden" id="__dt_settings" style="top:100px;right:100px;width:280px;height:320px;">
            <div class="__dt_header">
                <span class="__dt_title">Settings</span>
                <div class="__dt_btns">
                    <button class="__dt_hbtn __dt_transtoggle">◐</button>
                    <button class="__dt_hbtn __dt_mintoggle">−</button>
                    <button class="__dt_hbtn close __dt_closepanel">×</button>
                </div>
            </div>
            <div class="__dt_body">
                <div class="__dt_section">
                    <div class="__dt_label">Theme Color</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
                        <button class="__dt_preset" data-color="#00ffff" style="background:#00ffff" title="Cyan"></button>
                        <button class="__dt_preset" data-color="#ff00ff" style="background:#ff00ff" title="Magenta"></button>
                        <button class="__dt_preset" data-color="#00ff00" style="background:#00ff00" title="Green"></button>
                        <button class="__dt_preset" data-color="#ff6600" style="background:#ff6600" title="Orange"></button>
                        <button class="__dt_preset" data-color="#ff0066" style="background:#ff0066" title="Pink"></button>
                        <button class="__dt_preset" data-color="#6600ff" style="background:#6600ff" title="Purple"></button>
                        <button class="__dt_preset" data-color="#ffff00" style="background:#ffff00" title="Yellow"></button>
                        <button class="__dt_preset" data-color="#ffffff" style="background:#ffffff" title="White"></button>
                    </div>
                    <div class="__dt_clabel">Custom Color</div>
                    <input type="color" class="__dt_input __dt_color" id="__dt_theme_accent" value="${settings.theme.accent}">
                </div>
                <div class="__dt_section">
                    <div class="__dt_label">Actions</div>
                    <button class="__dt_btn" id="__dt_reset_settings">🔄 Reset to Defaults</button>
                    <button class="__dt_btn" id="__dt_reset_positions">📐 Reset Panel Positions</button>
                </div>
            </div>
            <div class="__dt_resize_r"></div>
            <div class="__dt_resize_c"></div>
            <div class="__dt_resize"></div>
        </div>

        <!-- SHORTCUTS PANEL -->
        <div class="__dt_panel hidden" id="__dt_shortcuts" style="top:120px;left:200px;width:260px;height:280px;">
            <div class="__dt_header">
                <span class="__dt_title">Keyboard Shortcuts</span>
                <div class="__dt_btns">
                    <button class="__dt_hbtn __dt_transtoggle">◐</button>
                    <button class="__dt_hbtn __dt_mintoggle">−</button>
                    <button class="__dt_hbtn close __dt_closepanel">×</button>
                </div>
            </div>
            <div class="__dt_body">
                <div class="__dt_shortcut"><span>Toggle DevTools</span><span class="__dt_kbd">Esc</span></div>
                <div class="__dt_shortcut"><span>Pick Element</span><span class="__dt_kbd">P</span></div>
                <div class="__dt_shortcut"><span>Undo Style Change</span><span class="__dt_kbd">Ctrl+Z</span></div>
                <div class="__dt_shortcut"><span>Hide Selected</span><span class="__dt_kbd">H</span></div>
                <div class="__dt_shortcut"><span>Show Selected</span><span class="__dt_kbd">S</span></div>
                <div class="__dt_shortcut"><span>Delete Selected</span><span class="__dt_kbd">Del</span></div>
                <div class="__dt_shortcut"><span>Copy Selector</span><span class="__dt_kbd">C</span></div>
                <div class="__dt_shortcut"><span>Outline All</span><span class="__dt_kbd">O</span></div>
            </div>
            <div class="__dt_resize_r"></div>
            <div class="__dt_resize_c"></div>
            <div class="__dt_resize"></div>
        </div>

        <!-- NETWORK PANEL -->
        <div class="__dt_panel hidden" id="__dt_network" style="bottom:20px;right:20px;width:500px;height:350px;">
            <div class="__dt_header">
                <span class="__dt_title">Network</span>
                <div class="__dt_btns">
                    <button class="__dt_hbtn __dt_transtoggle">◐</button>
                    <button class="__dt_hbtn __dt_mintoggle">−</button>
                    <button class="__dt_hbtn close __dt_closepanel">×</button>
                </div>
            </div>
            <div class="__dt_body" style="padding:8px;">
                <div class="__dt_net_filter">
                    <button class="__dt_net_filter_btn active" data-filter="all">All</button>
                    <button class="__dt_net_filter_btn" data-filter="fetch">Fetch</button>
                    <button class="__dt_net_filter_btn" data-filter="xhr">XHR</button>
                    <button class="__dt_net_filter_btn" data-filter="img">Img</button>
                    <button class="__dt_net_filter_btn" data-filter="js">JS</button>
                    <button class="__dt_net_filter_btn" data-filter="css">CSS</button>
                    <button class="__dt_btn" id="__dt_net_clear" style="margin-left:auto;width:auto;padding:3px 10px;margin-bottom:0">Clear</button>
                </div>
                <div class="__dt_net_header">
                    <span style="min-width:35px">Method</span>
                    <span style="min-width:30px">Status</span>
                    <span style="flex:1">URL</span>
                    <span style="min-width:45px;text-align:right">Time</span>
                    <span style="min-width:50px;text-align:right">Size</span>
                </div>
                <div id="__dt_net_list" style="max-height:180px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:0 0 4px 4px;"></div>
                <div id="__dt_net_detail" class="__dt_net_detail" style="display:none;"></div>
            </div>
            <div class="__dt_resize_r"></div>
            <div class="__dt_resize_c"></div>
            <div class="__dt_resize"></div>
        </div>

        <div id="__dt_hover"></div>
        <div id="__dt_snap_preview"></div>
    `;
    document.body.appendChild(d);

    // Apply theme
    updateThemeCSS();

    // ==========================================
    // STATE
    // ==========================================
    let sel = null;
    let pick = false;
    let zIndex = 2147483647;

    // ==========================================
    // PANEL CLASS
    // ==========================================
    class Panel {
        constructor(el) {
            this.el = el;
            this.id = el.id;
            this.header = el.querySelector('.__dt_header');
            this.drag = false;
            this.resize = null;
            this.ox = 0; this.oy = 0;
            this.startW = 0; this.startH = 0;
            this.startX = 0; this.startY = 0;
            this.init();
            this.restorePosition();
        }

        restorePosition() {
            if (settings.panels[this.id]) {
                const p = settings.panels[this.id];
                this.el.style.left = p.left;
                this.el.style.top = p.top;
                this.el.style.width = p.width;
                this.el.style.height = p.height;
                this.el.style.right = 'auto';
                this.el.style.bottom = 'auto';
            }
        }

        savePosition() {
            settings.panels[this.id] = {
                left: this.el.style.left,
                top: this.el.style.top,
                width: this.el.style.width,
                height: this.el.style.height
            };
            saveSettings();
        }

        init() {
            this.header.addEventListener('mousedown', (e) => {
                if (e.target.closest('.__dt_hbtn')) return;
                this.drag = true;
                this.ox = e.clientX - this.el.offsetLeft;
                this.oy = e.clientY - this.el.offsetTop;
                this.el.style.zIndex = ++zIndex;
                e.preventDefault();
            });

            const resizeB = this.el.querySelector('.__dt_resize');
            const resizeR = this.el.querySelector('.__dt_resize_r');
            const resizeC = this.el.querySelector('.__dt_resize_c');

            const startResize = (e, mode) => {
                this.resize = mode;
                this.startW = this.el.offsetWidth;
                this.startH = this.el.offsetHeight;
                this.startX = e.clientX;
                this.startY = e.clientY;
                e.preventDefault();
                e.stopPropagation();
            };

            resizeB?.addEventListener('mousedown', (e) => startResize(e, 'h'));
            resizeR?.addEventListener('mousedown', (e) => startResize(e, 'w'));
            resizeC?.addEventListener('mousedown', (e) => startResize(e, 'both'));

            this.el.querySelector('.__dt_transtoggle')?.addEventListener('click', (e) => {
                this.el.classList.toggle('transparent');
                e.target.classList.toggle('active');
            });

            this.el.querySelector('.__dt_mintoggle')?.addEventListener('click', () => {
                this.el.classList.toggle('minimized');
            });

            this.el.querySelector('.__dt_closepanel')?.addEventListener('click', () => {
                this.el.classList.add('hidden');
            });

            this.el.addEventListener('mousedown', () => {
                this.el.style.zIndex = ++zIndex;
            });
        }

        getSnapZone(x, y) {
            const edge = 40;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            if (x <= edge && y <= edge) return 'top-left';
            if (x >= vw - edge && y <= edge) return 'top-right';
            if (x <= edge && y >= vh - edge) return 'bottom-left';
            if (x >= vw - edge && y >= vh - edge) return 'bottom-right';

            if (x <= edge) return 'left';
            if (x >= vw - edge) return 'right';
            if (y <= edge) return 'top';
            if (y >= vh - edge) return 'bottom';

            return null;
        }

        showSnapPreview(zone) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const p = d.querySelector('#__dt_snap_preview');

            const zones = {
                'left': { left: 0, top: 0, width: vw/2, height: vh },
                'right': { left: vw/2, top: 0, width: vw/2, height: vh },
                'top': { left: 0, top: 0, width: vw, height: vh/2 },
                'bottom': { left: 0, top: vh/2, width: vw, height: vh/2 },
                'top-left': { left: 0, top: 0, width: vw/2, height: vh/2 },
                'top-right': { left: vw/2, top: 0, width: vw/2, height: vh/2 },
                'bottom-left': { left: 0, top: vh/2, width: vw/2, height: vh/2 },
                'bottom-right': { left: vw/2, top: vh/2, width: vw/2, height: vh/2 }
            };

            if (zone && zones[zone]) {
                const z = zones[zone];
                p.style.left = z.left + 'px';
                p.style.top = z.top + 'px';
                p.style.width = z.width + 'px';
                p.style.height = z.height + 'px';
                p.style.display = 'block';
            } else {
                p.style.display = 'none';
            }
        }

        snapToZone(zone) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            if (!this.originalSize) {
                this.originalSize = {
                    width: this.el.offsetWidth,
                    height: this.el.offsetHeight
                };
            }

            const zones = {
                'left': { left: 0, top: 0, width: vw/2, height: vh },
                'right': { left: vw/2, top: 0, width: vw/2, height: vh },
                'top': { left: 0, top: 0, width: vw, height: vh/2 },
                'bottom': { left: 0, top: vh/2, width: vw, height: vh/2 },
                'top-left': { left: 0, top: 0, width: vw/2, height: vh/2 },
                'top-right': { left: vw/2, top: 0, width: vw/2, height: vh/2 },
                'bottom-left': { left: 0, top: vh/2, width: vw/2, height: vh/2 },
                'bottom-right': { left: vw/2, top: vh/2, width: vw/2, height: vh/2 }
            };

            if (zones[zone]) {
                const z = zones[zone];
                this.el.style.left = z.left + 'px';
                this.el.style.top = z.top + 'px';
                this.el.style.width = z.width + 'px';
                this.el.style.height = z.height + 'px';
                this.el.style.right = 'auto';
                this.el.style.bottom = 'auto';
                this.snapped = true;
            }
        }

        onMove(e) {
            if (this.drag) {
                if (this.snapped && this.originalSize) {
                    this.el.style.width = this.originalSize.width + 'px';
                    this.el.style.height = this.originalSize.height + 'px';
                    this.snapped = false;
                }

                let x = e.clientX - this.ox;
                let y = e.clientY - this.oy;

                this.el.style.left = x + 'px';
                this.el.style.top = y + 'px';
                this.el.style.right = 'auto';
                this.el.style.bottom = 'auto';

                const zone = this.getSnapZone(e.clientX, e.clientY);
                this.pendingSnap = zone;
                this.showSnapPreview(zone);
            }
            if (this.resize) {
                const dx = e.clientX - this.startX;
                const dy = e.clientY - this.startY;
                if (this.resize === 'w' || this.resize === 'both') {
                    this.el.style.width = Math.max(200, this.startW + dx) + 'px';
                }
                if (this.resize === 'h' || this.resize === 'both') {
                    this.el.style.height = Math.max(100, this.startH + dy) + 'px';
                }
            }
        }

        onUp() {
            if (this.drag && this.pendingSnap) {
                this.snapToZone(this.pendingSnap);
            }
            if (this.drag || this.resize) {
                this.savePosition();
            }
            this.drag = false;
            this.resize = null;
            this.pendingSnap = null;
            d.querySelector('#__dt_snap_preview').style.display = 'none';
        }
    }

    const panels = [];
    d.querySelectorAll('.__dt_panel').forEach(el => panels.push(new Panel(el)));
    document.addEventListener('mousemove', (e) => panels.forEach(p => p.onMove(e)));
    document.addEventListener('mouseup', () => panels.forEach(p => p.onUp()));

    // ==========================================
    // UI CONTROLS
    // ==========================================
    d.querySelector('.__dt_closemain').onclick = () => {
        d.querySelector('#__dt_hub').classList.add('hidden');
    };

    d.querySelectorAll('.__dt_tool').forEach(btn => {
        btn.onclick = () => {
            const panel = d.querySelector('#' + btn.dataset.panel);
            panel.classList.remove('hidden');
            panel.style.zIndex = ++zIndex;
        };
    });

    d.querySelector('#__dt_closeall').onclick = () => {
        d.querySelectorAll('.__dt_panel').forEach(p => {
            if (p.id !== '__dt_hub') p.classList.add('hidden');
        });
    };

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    const getSelector = (el) => {
        if (el.id) return '#' + el.id;
        if (el.className && typeof el.className === 'string') {
            const classes = el.className.split(' ').filter(c => c && !c.startsWith('__dt'));
            if (classes.length) return el.tagName.toLowerCase() + '.' + classes.join('.');
        }
        return el.tagName.toLowerCase();
    };

    const pushHistory = () => {
        if (sel) {
            styleHistory.splice(historyIndex + 1);
            styleHistory.push({ el: sel, style: sel.style.cssText });
            historyIndex = styleHistory.length - 1;
        }
    };

    const undo = () => {
        if (historyIndex >= 0) {
            const h = styleHistory[historyIndex];
            h.el.style.cssText = h.style;
            historyIndex--;
            log('Undone');
        }
    };

    // ==========================================
    // INSPECTOR
    // ==========================================
    const hoverBox = d.querySelector('#__dt_hover');
    const pickBtn = d.querySelector('#__dt_pick');

    const startPick = () => {
        pick = !pick;
        pickBtn.classList.toggle('active');
        pickBtn.innerHTML = pick ? '🎯 Click element... <span class="__dt_kbd">P</span>' : '👆 Pick Element <span class="__dt_kbd">P</span>';
        document.body.style.cursor = pick ? 'crosshair' : '';
        if (!pick) hoverBox.style.display = 'none';
    };

    pickBtn.onclick = startPick;

    document.addEventListener('mouseover', (e) => {
        if (!pick) return;
        if (e.target.closest('#__devtools_main')) return;
        const r = e.target.getBoundingClientRect();
        hoverBox.style.display = 'block';
        hoverBox.style.left = r.left + 'px';
        hoverBox.style.top = r.top + 'px';
        hoverBox.style.width = r.width + 'px';
        hoverBox.style.height = r.height + 'px';
    });

    document.addEventListener('click', (e) => {
        if (!pick) return;
        if (e.target.closest('#__devtools_main')) return;
        e.preventDefault();
        e.stopPropagation();

        if (sel) sel.style.outline = '';
        sel = e.target;

        if (!modifiedElements.has(sel)) {
            modifiedElements.set(sel, sel.style.cssText);
        }

        sel.style.outline = `2px solid ${settings.theme.accent}`;

        const selector = getSelector(sel);
        const rect = sel.getBoundingClientRect();

        d.querySelector('#__dt_info').innerHTML = `<b>${selector}</b><br>Size: ${Math.round(rect.width)} × ${Math.round(rect.height)}<br>Pos: ${Math.round(rect.left)}, ${Math.round(rect.top)}`;

        const cs = getComputedStyle(sel);
        d.querySelector('#__dt_width').value = parseInt(cs.width) || 0;
        d.querySelector('#__dt_widthval').textContent = cs.width;
        d.querySelector('#__dt_height').value = parseInt(cs.height) || 0;
        d.querySelector('#__dt_heightval').textContent = cs.height;
        d.querySelector('#__dt_padding').value = parseInt(cs.padding) || 0;
        d.querySelector('#__dt_margin').value = parseInt(cs.margin) || 0;
        d.querySelector('#__dt_radius').value = parseInt(cs.borderRadius) || 0;
        d.querySelector('#__dt_radiusval').textContent = cs.borderRadius || '0px';
        d.querySelector('#__dt_opacity').value = Math.round(parseFloat(cs.opacity) * 100);
        d.querySelector('#__dt_opacityval').textContent = Math.round(parseFloat(cs.opacity) * 100) + '%';

        pick = false;
        pickBtn.classList.remove('active');
        pickBtn.innerHTML = '👆 Pick Element <span class="__dt_kbd">P</span>';
        document.body.style.cursor = '';
        hoverBox.style.display = 'none';
    }, true);

    // Actions
    d.querySelector('#__dt_hide').onclick = () => { if (sel) { pushHistory(); sel.style.display = 'none'; } };
    d.querySelector('#__dt_show').onclick = () => { if (sel) { pushHistory(); sel.style.display = ''; } };
    d.querySelector('#__dt_remove').onclick = () => { if (sel) { sel.remove(); sel = null; d.querySelector('#__dt_info').innerHTML = 'Removed'; } };
    d.querySelector('#__dt_copy').onclick = () => { if (sel) { navigator.clipboard.writeText(sel.outerHTML); d.querySelector('#__dt_info').innerHTML += '<br><i>HTML Copied!</i>'; } };
    d.querySelector('#__dt_copyselector').onclick = () => {
        if (sel) {
            const selector = getSelector(sel);
            navigator.clipboard.writeText(selector);
            d.querySelector('#__dt_info').innerHTML += '<br><i>Selector Copied!</i>';
        }
    };

    d.querySelector('#__dt_outlineall').onclick = function() {
        const all = document.querySelectorAll('body *:not(#__devtools_main):not(#__devtools_main *)');
        const has = this.textContent.includes('Clear');
        all.forEach(el => { el.style.outline = has ? '' : `1px solid ${accentRGB(0.3)}`; });
        this.textContent = has ? 'Outline All' : 'Clear Outlines';
    };

    // ==========================================
    // STYLES
    // ==========================================
    const applyStyle = (prop, value) => {
        if (sel) {
            pushHistory();
            sel.style[prop] = value;
        }
    };

    d.querySelector('#__dt_width').oninput = (e) => {
        const v = e.target.value;
        d.querySelector('#__dt_widthval').textContent = v == 0 ? 'auto' : v + 'px';
        applyStyle('width', v == 0 ? '' : v + 'px');
    };
    d.querySelector('#__dt_height').oninput = (e) => {
        const v = e.target.value;
        d.querySelector('#__dt_heightval').textContent = v == 0 ? 'auto' : v + 'px';
        applyStyle('height', v == 0 ? '' : v + 'px');
    };
    d.querySelector('#__dt_padding').oninput = (e) => applyStyle('padding', e.target.value + 'px');
    d.querySelector('#__dt_margin').oninput = (e) => applyStyle('margin', e.target.value + 'px');
    d.querySelector('#__dt_bg').oninput = (e) => applyStyle('backgroundColor', e.target.value);
    d.querySelector('#__dt_fg').oninput = (e) => applyStyle('color', e.target.value);
    d.querySelector('#__dt_border').oninput = (e) => applyStyle('borderColor', e.target.value);
    d.querySelector('#__dt_borderw').oninput = (e) => applyStyle('border', e.target.value + 'px solid ' + d.querySelector('#__dt_border').value);
    d.querySelector('#__dt_radius').oninput = (e) => {
        d.querySelector('#__dt_radiusval').textContent = e.target.value + 'px';
        applyStyle('borderRadius', e.target.value + 'px');
    };
    d.querySelector('#__dt_opacity').oninput = (e) => {
        d.querySelector('#__dt_opacityval').textContent = e.target.value + '%';
        applyStyle('opacity', e.target.value / 100);
    };

    d.querySelector('#__dt_undo').onclick = undo;

    d.querySelector('#__dt_export').onclick = () => {
        if (modifiedElements.size === 0) { alert('No modifications'); return; }
        let css = '/* Dev Tools Export */\n\n';
        modifiedElements.forEach((orig, el) => {
            if (!document.contains(el)) return;
            const selector = getSelector(el);
            const styles = el.style.cssText.replace(/outline[^;]*;?/gi, '').trim();
            if (styles) css += `${selector} {\n    ${styles.split(';').filter(s => s.trim()).join(';\n    ')};\n}\n\n`;
        });
        const blob = new Blob([css], { type: 'text/css' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'devtools-export.css';
        a.click();
    };

    // ==========================================
    // CONSOLE
    // ==========================================
    const logs = d.querySelector('#__dt_logs');
    const log = (msg, type = '') => {
        const color = type === 'error' ? '#ff4444' : type === 'warn' ? '#ffa500' : settings.theme.accent;
        logs.innerHTML += `<div style="color:${color}">${msg}</div>`;
        logs.scrollTop = logs.scrollHeight;
    };

    d.querySelector('#__dt_run').onclick = () => {
        const code = d.querySelector('#__dt_eval').value;
        if (!code) return;
        try {
            const r = eval(code);
            log('> ' + code);
            log('= ' + (typeof r === 'object' ? JSON.stringify(r) : r));
        } catch (e) { log('Error: ' + e.message, 'error'); }
    };
    d.querySelector('#__dt_eval').onkeydown = (e) => { if (e.key === 'Enter') d.querySelector('#__dt_run').click(); };
    d.querySelector('#__dt_clear').onclick = () => { logs.innerHTML = ''; };

    // ==========================================
    // ELEMENT SEARCH
    // ==========================================
    d.querySelector('#__dt_searchbtn').onclick = () => {
        const q = d.querySelector('#__dt_search').value.trim();
        if (!q) return;
        const results = d.querySelector('#__dt_results');
        try {
            const els = document.querySelectorAll(q);
            if (els.length === 0) { results.innerHTML = '<div style="color:#ffa500">No results</div>'; return; }
            results.innerHTML = '';
            els.forEach((el, i) => {
                if (el.closest('#__devtools_main')) return;
                const selector = getSelector(el);
                const item = document.createElement('div');
                item.style.cssText = 'padding:4px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.1)';
                item.textContent = `${i + 1}. ${selector}`;
                item.onclick = () => {
                    if (sel) sel.style.outline = '';
                    sel = el;
                    sel.style.outline = `2px solid ${settings.theme.accent}`;
                    sel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                };
                results.appendChild(item);
            });
        } catch (e) { results.innerHTML = `<div style="color:#ff4444">${e.message}</div>`; }
    };

    // ==========================================
    // SETTINGS
    // ==========================================
    const setTheme = (color) => {
        settings.theme.accent = color;
        d.querySelector('#__dt_theme_accent').value = color;
        updateThemeCSS();
        saveSettings();

        // Update preset buttons
        d.querySelectorAll('.__dt_preset').forEach(p => {
            p.classList.toggle('active', p.dataset.color === color);
        });

        // Update selection outline
        if (sel) sel.style.outline = `2px solid ${color}`;
    };

    d.querySelectorAll('.__dt_preset').forEach(btn => {
        if (btn.dataset.color === settings.theme.accent) btn.classList.add('active');
        btn.onclick = () => setTheme(btn.dataset.color);
    });

    d.querySelector('#__dt_theme_accent').oninput = (e) => setTheme(e.target.value);

    d.querySelector('#__dt_reset_settings').onclick = () => {
        settings = { ...defaultSettings };
        setTheme(defaultSettings.theme.accent);
        log('Settings reset');
    };

    d.querySelector('#__dt_reset_positions').onclick = () => {
        settings.panels = {};
        saveSettings();
        location.reload();
    };

    // ==========================================
    // KEYBOARD SHORTCUTS
    // ==========================================
    document.addEventListener('keydown', (e) => {
        // Don't trigger if typing in input
        if (e.target.closest('input, textarea')) return;
        if (e.target.closest('#__devtools_main') && e.target.tagName === 'INPUT') return;

        const key = e.key.toLowerCase();

        if (key === 'escape') {
            const hub = d.querySelector('#__dt_hub');
            hub.classList.toggle('hidden');
        }
        else if (key === 'p' && !e.ctrlKey) {
            startPick();
        }
        else if (key === 'z' && e.ctrlKey) {
            e.preventDefault();
            undo();
        }
        else if (key === 'h' && sel) {
            pushHistory();
            sel.style.display = 'none';
        }
        else if (key === 's' && !e.ctrlKey && sel) {
            pushHistory();
            sel.style.display = '';
        }
        else if (key === 'delete' && sel) {
            sel.remove();
            sel = null;
        }
        else if (key === 'c' && !e.ctrlKey && sel) {
            const selector = getSelector(sel);
            navigator.clipboard.writeText(selector);
            log('Selector copied: ' + selector);
        }
        else if (key === 'o' && !e.ctrlKey) {
            d.querySelector('#__dt_outlineall').click();
        }
    });

    // ==========================================
    // NETWORK INTERCEPTOR
    // ==========================================
    const networkRequests = [];
    let networkFilter = 'all';
    const netList = d.querySelector('#__dt_net_list');
    const netDetail = d.querySelector('#__dt_net_detail');

    const formatSize = (bytes) => {
        if (bytes === 0 || bytes === undefined) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatTime = (ms) => {
        if (ms === undefined) return '-';
        if (ms < 1000) return Math.round(ms) + 'ms';
        return (ms / 1000).toFixed(2) + 's';
    };

    const getRequestType = (url, initiator) => {
        if (initiator === 'fetch') return 'fetch';
        if (initiator === 'xhr') return 'xhr';
        const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(ext)) return 'img';
        if (['js', 'mjs'].includes(ext)) return 'js';
        if (ext === 'css') return 'css';
        return 'other';
    };

    const renderNetworkList = () => {
        const filtered = networkFilter === 'all'
            ? networkRequests
            : networkRequests.filter(r => r.type === networkFilter);

        netList.innerHTML = filtered.map((req, i) => {
            const statusClass = req.status ?
                (req.status < 300 ? 's2xx' : req.status < 400 ? 's3xx' : req.status < 500 ? 's4xx' : 's5xx') : '';
            const errorClass = req.error ? 'error' : '';
            const pendingClass = req.pending ? 'pending' : '';

            return `<div class="__dt_net_item ${errorClass} ${pendingClass}" data-index="${i}">
                <span class="__dt_net_method">${req.method}</span>
                <span class="__dt_net_status ${statusClass}">${req.status || (req.pending ? '...' : 'ERR')}</span>
                <span class="__dt_net_url" title="${req.url}">${req.url.replace(/^https?:\/\/[^/]+/, '')}</span>
                <span class="__dt_net_time">${formatTime(req.duration)}</span>
                <span class="__dt_net_size">${formatSize(req.size)}</span>
            </div>`;
        }).join('');

        // Add click handlers for detail view
        netList.querySelectorAll('.__dt_net_item').forEach(item => {
            item.onclick = () => {
                const req = filtered[parseInt(item.dataset.index)];
                showNetDetail(req);
            };
        });
    };

    const showNetDetail = (req) => {
        netDetail.style.display = 'block';
        netDetail.innerHTML = `
            <div class="__dt_net_detail_title">${req.method} ${req.url}</div>
            <div><b>Status:</b> ${req.status || 'Error'}</div>
            <div><b>Type:</b> ${req.type}</div>
            <div><b>Time:</b> ${formatTime(req.duration)}</div>
            <div><b>Size:</b> ${formatSize(req.size)}</div>
            ${req.error ? `<div style="color:#f44"><b>Error:</b> ${req.error}</div>` : ''}
            ${req.responseHeaders ? `<div style="margin-top:6px"><b>Response Headers:</b><pre style="font-size:8px;color:#888;margin-top:2px">${req.responseHeaders}</pre></div>` : ''}
        `;
    };

    const addNetworkRequest = (req) => {
        networkRequests.unshift(req);
        if (networkRequests.length > 100) networkRequests.pop();
        renderNetworkList();
    };

    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
        const method = args[1]?.method || 'GET';
        const startTime = performance.now();

        const req = {
            url,
            method: method.toUpperCase(),
            type: 'fetch',
            pending: true,
            startTime
        };
        addNetworkRequest(req);

        try {
            const response = await originalFetch.apply(this, args);
            req.pending = false;
            req.status = response.status;
            req.duration = performance.now() - startTime;

            // Get response headers
            const headers = [];
            response.headers.forEach((v, k) => headers.push(`${k}: ${v}`));
            req.responseHeaders = headers.join('\n');

            // Clone to read size
            const clone = response.clone();
            try {
                const blob = await clone.blob();
                req.size = blob.size;
            } catch (e) {}

            renderNetworkList();
            return response;
        } catch (error) {
            req.pending = false;
            req.error = error.message;
            req.duration = performance.now() - startTime;
            renderNetworkList();
            throw error;
        }
    };

    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this.__dt_method = method;
        this.__dt_url = url;
        return originalXHROpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
        const startTime = performance.now();
        const req = {
            url: this.__dt_url,
            method: (this.__dt_method || 'GET').toUpperCase(),
            type: 'xhr',
            pending: true,
            startTime
        };
        addNetworkRequest(req);

        this.addEventListener('load', () => {
            req.pending = false;
            req.status = this.status;
            req.duration = performance.now() - startTime;
            req.size = this.responseText?.length || 0;
            req.responseHeaders = this.getAllResponseHeaders();
            renderNetworkList();
        });

        this.addEventListener('error', () => {
            req.pending = false;
            req.error = 'Network error';
            req.duration = performance.now() - startTime;
            renderNetworkList();
        });

        return originalXHRSend.apply(this, args);
    };

    // Observe resource loading via PerformanceObserver
    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') continue;

                const req = {
                    url: entry.name,
                    method: 'GET',
                    type: getRequestType(entry.name, entry.initiatorType),
                    status: 200,
                    duration: entry.duration,
                    size: entry.transferSize || entry.encodedBodySize,
                    pending: false
                };
                addNetworkRequest(req);
            }
        });
        observer.observe({ entryTypes: ['resource'] });
    } catch (e) {}

    // Network filter buttons
    d.querySelectorAll('.__dt_net_filter_btn').forEach(btn => {
        btn.onclick = () => {
            d.querySelectorAll('.__dt_net_filter_btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            networkFilter = btn.dataset.filter;
            renderNetworkList();
        };
    });

    d.querySelector('#__dt_net_clear').onclick = () => {
        networkRequests.length = 0;
        netDetail.style.display = 'none';
        renderNetworkList();
    };

    // ==========================================
    // GLOBAL API
    // ==========================================
    window.__devtools = {
        toggle: () => {
            const hub = d.querySelector('#__dt_hub');
            hub.classList.toggle('hidden');
        },
        setTheme: setTheme,
        settings: settings,
        network: networkRequests
    };

    log('Dev Tools v2.1 ready');
    log('Press Esc to toggle, P to pick');
})();
