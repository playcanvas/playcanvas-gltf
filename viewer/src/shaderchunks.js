ShaderChunks = function() {
    this.shaderchunks = document.getElementById("shaderchunks");
    
    this.shaderchunks_toggle = document.getElementById("shaderchunks_toggle");
    this.shaderchunks_toggle.onclick = function(e) {
        this.toggle();
    }.bind(this);    
    
    this.textareas = {};
    for (var name in pc.shaderChunks) {
        var shaderChunk = pc.shaderChunks[name];
        if (typeof shaderChunk !== "string") // there are a few functions
            continue;
        // add text
        var text = document.createElement("div");
        text.innerHTML = name;
        this.shaderchunks.appendChild(text);
        // add textarea
        var textarea = document.createElement("textarea");
        textarea.value = shaderChunk;
        textarea_fit_text(textarea);
        textarea_enable_tab_indent(textarea);
        textarea.shaderChunkName = name;
        textarea.originalShaderChunk = shaderChunk;
        textarea.oninput = function(e) {
            // immediately mirror textarea edits into pc.shaderChunks
            pc.shaderChunks[this.shaderChunkName] = this.value;
            //console.log(this.shaderChunkName, this.value);
        }
        this.textareas[name] = textarea;
        this.shaderchunks.appendChild(textarea);
    }
    this.shaderchunks.style.position = "absolute";
    this.shaderchunks.style.left = "0px";
    this.shaderchunks.style.top = "40px";
    this.shaderchunks.style.overflow = "scroll";
    this.resize();
    this.disable();
}

ShaderChunks.prototype.enable = function() {
    this.shaderchunks.style.display = "";
    this.shaderchunks_toggle.value = "Hide ShaderChunks";
    this.enabled = true;
}

ShaderChunks.prototype.disable = function() {
    this.shaderchunks.style.display = "none";
    this.shaderchunks_toggle.value = "Show ShaderChunks";
    this.enabled = false;
}

ShaderChunks.prototype.toggle = function() {
    if (this.enabled)
        this.disable();
    else
        this.enable();
}

ShaderChunks.prototype.resize = function() {
    this.shaderchunks.style.width = window.innerWidth + "px";
    this.shaderchunks.style.height = (window.innerHeight - 40) + "px";
}