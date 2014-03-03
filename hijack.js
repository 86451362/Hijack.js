(function (root) {

    var Hijack = function (url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4 || xhr.status != 200) return;
            this.onload(xhr);
        }.bind(this);
        xhr.send();
    };

    Hijack.prototype.onload = function (xhr) {
        this.hijack(new DOMParser().parseFromString(xhr.responseText, 'text/html'));
    };

    Hijack.prototype.policies = {
        'SCRIPT': [
            function (node) {
                // In Firefox 4.0, the async DOM property defaults to true for script-created scripts, so the default behavior matches the behavior of IE and WebKit.
                // https://developer.mozilla.org/en/docs/Web/HTML/Element/script#Async_support
                node.async = false;
                return node;
            }
        ]
    };

    Hijack.prototype.hijack = function (doc) {
        this.append('head', doc);
        this.append('body', doc);
    };

    Hijack.prototype.append = function (tag, doc) {
        var childNodes = doc.getElementsByTagName(tag)[0].childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            document.getElementsByTagName(tag)[0].appendChild(
                this.applyPolicies(document.importNode(childNodes[i]))
            );
        }
    };

    Hijack.prototype.addPolicy = function (tagName, policy) {
        if(!this.policies[tagName]) {
            this.policies[tagName] = [];
        }

        this.policies[tagName].push(policy);
    };

    Hijack.prototype.applyPolicies = function (node) {
        if(!this.policies[node.tagName]) return node;

        for(var i = 0; i < this.policies[node.tagName].length; i++) {
            node = this.policies[node.tagName][i](node);
        }

        return node;
    };

    root.hijack = function (url) {
        new Hijack(url);
    };

    root.Hijack = Hijack;

}(this));
