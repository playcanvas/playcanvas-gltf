ShaderChunks = function() {
    this.shaderchunks = document.getElementById("shaderchunks");
    this.htmlShaderChunks = {};
    for (var name in pc.shaderChunks) {
        var text = document.createElement("div");
        var textarea = document.createElement("textarea");
        text.innerHTML = name;
        textarea.value = pc.shaderChunks[name];
        this.htmlShaderChunks[name] = textarea;
        this.shaderchunks.appendChild(text);
        this.shaderchunks.appendChild(textarea);
    }
    this.shaderchunks.style.overflow = "scroll";
    this.resize();
}

ShaderChunks.prototype.resize = function() {
    this.shaderchunks.style.height = window.innerHeight + "px";
}