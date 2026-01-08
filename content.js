// PKN Dev Tools - Full Featured Chrome Extension
(function() {
    // Toggle if already exists
    if (window.__devtools) {
        window.__devtools.toggle();
        return;
    }

    // Track modified elements for CSS export
    const modifiedElements = new Map();

    // Create main panel
    const d = document.createElement('div');
    d.id = '__devtools_main';
    d.innerHTML = `
        <style>
            .__dt_panel {
                position: fixed;
                background: rgba(15, 15, 20, 0.92);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 12px;
                font-family: 'Courier New', monospace;
                z-index: 2147483647;
                box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(0,255,255,0.15);
                color: #e0e0e0;
                font-size: 12px;
                min-width: 200px;
                display: flex;
                flex-direction: column;
            }
            .__dt_panel.transparent {
                background: rgba(0, 0, 0, 0.15);
                backdrop-filter: none;
            }
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
                background: rgba(0, 255, 255, 0.1);
                border-bottom: 1px solid rgba(0, 255, 255, 0.3);
                cursor: move;
                border-radius: 10px 10px 0 0;
                flex-shrink: 0;
            }
            .__dt_title {
                color: #00ffff;
                font-weight: bold;
                text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
                font-size: 12px;
            }
            .__dt_btns { display: flex; gap: 3px; }
            .__dt_hbtn {
                background: rgba(255,255,255,0.1);
                border: none;
                color: #00ffff;
                width: 20px;
                height: 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .__dt_hbtn:hover { background: rgba(0,255,255,0.3); }
            .__dt_hbtn.close:hover { background: rgba(255,68,68,0.5); color: white; }
            .__dt_hbtn.active { background: rgba(0,255,255,0.4); }

            .__dt_body {
                padding: 12px;
                overflow-y: auto;
                flex: 1;
                min-height: 0;
            }
            .__dt_body::-webkit-scrollbar { width: 5px; }
            .__dt_body::-webkit-scrollbar-thumb { background: rgba(0,255,255,0.4); border-radius: 3px; }

            .__dt_resize {
                height: 8px;
                background: linear-gradient(90deg, transparent 30%, rgba(0,255,255,0.3) 50%, transparent 70%);
                cursor: ns-resize;
                flex-shrink: 0;
            }
            .__dt_resize_r {
                position: absolute;
                right: 0;
                top: 35px;
                bottom: 8px;
                width: 8px;
                cursor: ew-resize;
            }
            .__dt_resize_c {
                position: absolute;
                right: 0;
                bottom: 0;
                width: 14px;
                height: 14px;
                cursor: se-resize;
            }
            .__dt_resize_c::after {
                content: '';
                position: absolute;
                right: 3px;
                bottom: 3px;
                width: 6px;
                height: 6px;
                border-right: 2px solid rgba(0,255,255,0.5);
                border-bottom: 2px solid rgba(0,255,255,0.5);
            }

            .__dt_section { margin-bottom: 12px; }
            .__dt_label {
                color: #00ffff;
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 6px;
            }
            .__dt_btn {
                width: 100%;
                padding: 8px;
                margin-bottom: 5px;
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: #00ffff;
                border-radius: 5px;
                cursor: pointer;
                font-family: inherit;
                font-size: 11px;
                transition: all 0.15s;
            }
            .__dt_btn:hover { background: rgba(0, 255, 255, 0.25); border-color: #00ffff; }
            .__dt_btn.active { background: rgba(0, 255, 255, 0.3); }
            .__dt_row { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
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
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: #e0e0e0;
                padding: 6px 8px;
                border-radius: 4px;
                font-family: inherit;
                font-size: 11px;
            }
            .__dt_input:focus { outline: none; border-color: #00ffff; }

            .__dt_tool {
                padding: 14px 10px;
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 8px;
                background: rgba(0, 255, 255, 0.05);
                color: #00ffff;
                cursor: pointer;
                font-family: inherit;
                font-size: 10px;
                text-align: center;
                transition: all 0.2s;
            }
            .__dt_tool:hover {
                background: rgba(0, 255, 255, 0.15);
                border-color: #00ffff;
                box-shadow: 0 0 12px rgba(0, 255, 255, 0.2);
            }
            .__dt_tool_icon { font-size: 20px; display: block; margin-bottom: 4px; }
            .__dt_grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

            #__dt_hover {
                position: fixed;
                border: 2px dashed #00ffff;
                background: rgba(0, 255, 255, 0.1);
                pointer-events: none;
                z-index: 2147483646;
                display: none;
            }

            .__dt_clabel { font-size: 9px; color: #888; margin-bottom: 2px; }
            .__dt_color { height: 28px; padding: 2px; }

            .__dt_range {
                width: 100%;
                height: 4px;
                -webkit-appearance: none;
                background: rgba(0, 255, 255, 0.2);
                border-radius: 2px;
                margin: 4px 0;
            }
            .__dt_range::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 12px;
                height: 12px;
                background: #00ffff;
                border-radius: 50%;
                cursor: pointer;
            }
            .__dt_val { font-size: 9px; color: #00ffff; text-align: right; }
        </style>

        <!-- MAIN HUB PANEL -->
        <div class="__dt_panel" id="__dt_hub" style="top:20px;right:20px;width:240px;height:320px;">
            <div class="__dt_header">
                <span class="__dt_title">Dev Tools</span>
                <div class="__dt_btns">
                    <button class="__dt_hbtn __dt_transtoggle" title="Transparent">◐</button>
                    <button class="__dt_hbtn __dt_mintoggle" title="Minimize">−</button>
                    <button class="__dt_hbtn close __dt_closemain" title="Close">×</button>
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
        <div class="__dt_panel hidden" id="__dt_inspector" style="top:80px;left:20px;width:280px;height:300px;">
            <div class="__dt_header">
                <span class="__dt_title">Inspector</span>
                <div class="__dt_btns">
                    <button class="__dt_hbtn __dt_transtoggle">◐</button>
                    <button class="__dt_hbtn __dt_mintoggle">−</button>
                    <button class="__dt_hbtn close __dt_closepanel">×</button>
                </div>
            </div>
            <div class="__dt_body">
                <button class="__dt_btn" id="__dt_pick">👆 Pick Element</button>
                <div class="__dt_section">
                    <div class="__dt_label">Selected</div>
                    <div class="__dt_info" id="__dt_info">Click "Pick Element" then select</div>
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
                </div>
            </div>
            <div class="__dt_resize_r"></div>
            <div class="__dt_resize_c"></div>
            <div class="__dt_resize"></div>
        </div>

        <!-- STYLES PANEL -->
        <div class="__dt_panel hidden" id="__dt_styles" style="top:80px;left:320px;width:260px;height:360px;">
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
                </div>
                <button class="__dt_btn" id="__dt_export">📤 Export CSS</button>
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

        <div id="__dt_hover"></div>
    `;
    document.body.appendChild(d);

    // State
    let sel = null;
    let pick = false;
    let zIndex = 2147483647;

    // Snap zones preview
    const snapPreview = document.createElement('div');
    snapPreview.id = '__dt_snap_preview';
    snapPreview.style.cssText = 'position:fixed;background:rgba(0,255,255,0.15);border:2px dashed #00ffff;display:none;z-index:2147483645;pointer-events:none;transition:all 0.1s ease;';
    d.appendChild(snapPreview);

    // Panel dragging & resizing
    class Panel {
        constructor(el) {
            this.el = el;
            this.header = el.querySelector('.__dt_header');
            this.drag = false;
            this.resize = null;
            this.ox = 0; this.oy = 0;
            this.startW = 0; this.startH = 0;
            this.startX = 0; this.startY = 0;
            this.init();
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

            // Transparent toggle
            this.el.querySelector('.__dt_transtoggle')?.addEventListener('click', (e) => {
                this.el.classList.toggle('transparent');
                e.target.classList.toggle('active');
            });

            // Minimize toggle
            this.el.querySelector('.__dt_mintoggle')?.addEventListener('click', () => {
                this.el.classList.toggle('minimized');
            });

            // Close (hide)
            this.el.querySelector('.__dt_closepanel')?.addEventListener('click', () => {
                this.el.classList.add('hidden');
            });

            this.el.addEventListener('mousedown', () => {
                this.el.style.zIndex = ++zIndex;
            });
        }
        getSnapZone(x, y) {
            const edge = 40; // Edge detection zone
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Corners first (they overlap edges)
            if (x <= edge && y <= edge) return 'top-left';
            if (x >= vw - edge && y <= edge) return 'top-right';
            if (x <= edge && y >= vh - edge) return 'bottom-left';
            if (x >= vw - edge && y >= vh - edge) return 'bottom-right';

            // Edges
            if (x <= edge) return 'left';
            if (x >= vw - edge) return 'right';
            if (y <= edge) return 'top';
            if (y >= vh - edge) return 'bottom';

            return null;
        }

        showSnapPreview(zone) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const p = snapPreview;

            const zones = {
                'left':         { left: 0, top: 0, width: vw/2, height: vh },
                'right':        { left: vw/2, top: 0, width: vw/2, height: vh },
                'top':          { left: 0, top: 0, width: vw, height: vh/2 },
                'bottom':       { left: 0, top: vh/2, width: vw, height: vh/2 },
                'top-left':     { left: 0, top: 0, width: vw/2, height: vh/2 },
                'top-right':    { left: vw/2, top: 0, width: vw/2, height: vh/2 },
                'bottom-left':  { left: 0, top: vh/2, width: vw/2, height: vh/2 },
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

            // Store original size for restore
            if (!this.originalSize) {
                this.originalSize = {
                    width: this.el.offsetWidth,
                    height: this.el.offsetHeight,
                    left: this.el.offsetLeft,
                    top: this.el.offsetTop
                };
            }

            const zones = {
                'left':         { left: 0, top: 0, width: vw/2, height: vh },
                'right':        { left: vw/2, top: 0, width: vw/2, height: vh },
                'top':          { left: 0, top: 0, width: vw, height: vh/2 },
                'bottom':       { left: 0, top: vh/2, width: vw, height: vh/2 },
                'top-left':     { left: 0, top: 0, width: vw/2, height: vh/2 },
                'top-right':    { left: vw/2, top: 0, width: vw/2, height: vh/2 },
                'bottom-left':  { left: 0, top: vh/2, width: vw/2, height: vh/2 },
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
                // Restore original size when dragging a snapped panel
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

                // Show snap preview
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
            this.drag = false;
            this.resize = null;
            this.pendingSnap = null;
            snapPreview.style.display = 'none';
        }
    }

    const panels = [];
    d.querySelectorAll('.__dt_panel').forEach(el => panels.push(new Panel(el)));
    document.addEventListener('mousemove', (e) => panels.forEach(p => p.onMove(e)));
    document.addEventListener('mouseup', () => panels.forEach(p => p.onUp()));

    // Close main = remove all
    d.querySelector('.__dt_closemain').onclick = () => {
        d.remove();
        window.__devtools = null;
    };

    // Tool buttons open panels
    d.querySelectorAll('.__dt_tool').forEach(btn => {
        btn.onclick = () => {
            const panel = d.querySelector('#' + btn.dataset.panel);
            panel.classList.remove('hidden');
            panel.style.zIndex = ++zIndex;
        };
    });

    // Close all panels
    d.querySelector('#__dt_closeall').onclick = () => {
        d.querySelectorAll('.__dt_panel').forEach(p => {
            if (p.id !== '__dt_hub') p.classList.add('hidden');
        });
    };

    // Hover box
    const hoverBox = d.querySelector('#__dt_hover');

    // Pick element
    const pickBtn = d.querySelector('#__dt_pick');
    pickBtn.onclick = () => {
        pick = !pick;
        pickBtn.classList.toggle('active');
        pickBtn.textContent = pick ? '🎯 Click element...' : '👆 Pick Element';
        document.body.style.cursor = pick ? 'crosshair' : '';
        if (!pick) hoverBox.style.display = 'none';
    };

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

        sel.style.outline = '2px solid #00ffff';

        const tag = sel.tagName.toLowerCase();
        const id = sel.id ? '#' + sel.id : '';
        const cls = (sel.className && typeof sel.className === 'string') ? '.' + sel.className.split(' ').filter(c=>c).join('.') : '';
        const rect = sel.getBoundingClientRect();

        d.querySelector('#__dt_info').innerHTML = `<b>${tag}${id}${cls}</b><br>Size: ${Math.round(rect.width)} × ${Math.round(rect.height)}<br>Pos: ${Math.round(rect.left)}, ${Math.round(rect.top)}`;

        // Update style controls
        const cs = getComputedStyle(sel);
        d.querySelector('#__dt_width').value = parseInt(cs.width) || 0;
        d.querySelector('#__dt_widthval').textContent = cs.width;
        d.querySelector('#__dt_height').value = parseInt(cs.height) || 0;
        d.querySelector('#__dt_heightval').textContent = cs.height;

        pick = false;
        pickBtn.classList.remove('active');
        pickBtn.textContent = '👆 Pick Element';
        document.body.style.cursor = '';
        hoverBox.style.display = 'none';
    }, true);

    // Actions
    d.querySelector('#__dt_hide').onclick = () => { if (sel) sel.style.display = 'none'; };
    d.querySelector('#__dt_show').onclick = () => { if (sel) sel.style.display = ''; };
    d.querySelector('#__dt_remove').onclick = () => { if (sel) { sel.remove(); sel = null; d.querySelector('#__dt_info').innerHTML = 'Removed'; }};
    d.querySelector('#__dt_copy').onclick = () => { if (sel) { navigator.clipboard.writeText(sel.outerHTML); d.querySelector('#__dt_info').innerHTML += '<br><i>Copied!</i>'; }};

    // Outline all
    d.querySelector('#__dt_outlineall').onclick = function() {
        const all = document.querySelectorAll('body *:not(#__devtools_main):not(#__devtools_main *)');
        const has = this.textContent.includes('Clear');
        all.forEach(el => { el.style.outline = has ? '' : '1px solid rgba(0,255,255,0.3)'; });
        this.textContent = has ? 'Outline All' : 'Clear Outlines';
    };

    // Style controls
    d.querySelector('#__dt_width').oninput = (e) => {
        const v = e.target.value;
        d.querySelector('#__dt_widthval').textContent = v == 0 ? 'auto' : v + 'px';
        if (sel) sel.style.width = v == 0 ? '' : v + 'px';
    };
    d.querySelector('#__dt_height').oninput = (e) => {
        const v = e.target.value;
        d.querySelector('#__dt_heightval').textContent = v == 0 ? 'auto' : v + 'px';
        if (sel) sel.style.height = v == 0 ? '' : v + 'px';
    };
    d.querySelector('#__dt_bg').oninput = (e) => { if (sel) sel.style.backgroundColor = e.target.value; };
    d.querySelector('#__dt_fg').oninput = (e) => { if (sel) sel.style.color = e.target.value; };
    d.querySelector('#__dt_border').oninput = (e) => { if (sel) sel.style.borderColor = e.target.value; };
    d.querySelector('#__dt_borderw').oninput = (e) => { if (sel) sel.style.border = e.target.value + 'px solid ' + d.querySelector('#__dt_border').value; };

    // Export CSS
    d.querySelector('#__dt_export').onclick = () => {
        if (modifiedElements.size === 0) { alert('No modifications'); return; }
        let css = '/* PKN Dev Tools Export */\n\n';
        modifiedElements.forEach((orig, el) => {
            if (!document.contains(el)) return;
            const selector = el.id ? '#' + el.id : el.className ? '.' + el.className.split(' ')[0] : el.tagName.toLowerCase();
            const styles = el.style.cssText.replace(/outline[^;]*;?/gi, '').trim();
            if (styles) css += `${selector} {\n    ${styles.split(';').filter(s=>s.trim()).join(';\n    ')};\n}\n\n`;
        });
        const blob = new Blob([css], {type: 'text/css'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'devtools-export.css';
        a.click();
    };

    // Console
    const logs = d.querySelector('#__dt_logs');
    const log = (msg, type = '') => {
        logs.innerHTML += `<div style="color:${type === 'error' ? '#ff4444' : type === 'warn' ? '#ffa500' : '#00ffff'}">${msg}</div>`;
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

    // Element search
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
                const tag = el.tagName.toLowerCase();
                const id = el.id ? '#' + el.id : '';
                const cls = el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '';
                const item = document.createElement('div');
                item.style.cssText = 'padding:4px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.1)';
                item.textContent = `${i+1}. ${tag}${id}${cls}`;
                item.onclick = () => {
                    if (sel) sel.style.outline = '';
                    sel = el;
                    sel.style.outline = '2px solid #00ffff';
                    sel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                };
                results.appendChild(item);
            });
        } catch (e) { results.innerHTML = `<div style="color:#ff4444">${e.message}</div>`; }
    };

    // Global
    window.__devtools = {
        toggle: () => {
            const hub = d.querySelector('#__dt_hub');
            hub.classList.toggle('hidden');
        }
    };

    log('Dev Tools ready');
})();
