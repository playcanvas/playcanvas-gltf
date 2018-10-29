ShaderChunks = function() {
    this.shaderchunks = document.getElementById("shaderchunks");
    this.htmlShaderChunks = {};
    for (var name in pc.shaderChunks) {
        var shaderChunk = pc.shaderChunks[name];
        if (typeof shaderChunk !== "string") // there are a few functions
            continue;
        var text = document.createElement("div");
        var textarea = document.createElement("textarea");
        text.innerHTML = name;
        var numNewlines = 1;
        for (var i=0; i<shaderChunk.length; i++)
            if (shaderChunk[i] == "\n")
                numNewlines++;
        textarea.value = shaderChunk;
        textarea.style.height = (numNewlines * 16) + "px";
        this.htmlShaderChunks[name] = textarea;
        this.shaderchunks.appendChild(text);
        this.shaderchunks.appendChild(textarea);
    }
    this.shaderchunks.style.position = "absolute";
    this.shaderchunks.style.left = "0px";
    this.shaderchunks.style.top = "40px";
    this.shaderchunks.style.overflow = "scroll";
    this.resize();
}

ShaderChunks.prototype.resize = function() {
    this.shaderchunks.style.width = window.innerWidth + "px";
    this.shaderchunks.style.height = (window.innerHeight - 40) + "px";
}