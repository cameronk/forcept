/**
 * forcept - core.js
 * @author Cameron Kelley, Azuru Networks
 * test
 */

var Core = {

    /**
     * Websocket address
     */
	socketAddress: "ws://" + location.hostname + ":5099",


    /**
     * Log to console
     */
	log: function(m) {
		console.log("[core.js] " + m);
	},


    /**
     * Switch the page by pushing to window history state
     * and then re-invoking Core.render()
     */
    switchPage: function(uri) {
        window.history.pushState("", {}, "http://" + window.location.host + uri);
        this.render();
    },


    /**
     * Set up React components to render.
     */
	render: function () {

        /// Slice and dice that URI!
		var uri = window.location.pathname.substring(1).split("/");
		var action = (typeof uri[0] !== "undefined" && uri[0].length > 0) ? uri[0] : "/";
		var identifier = (typeof uri[1] !== "undefined" && uri[0].length > 0) ? uri[1] : null;
		var content = document.getElementById("page-content");

		Core.log("Running render: " + JSON.stringify(uri));
		Core.log(" |--> action is " + action);
		Core.log(" |--> identifier is " + identifier);

        /// COMPONENTS ///
		switch(action) {


            /// Index
			case "/":
				this.Util.setPageTitle("Home");

				React.render(
					<HomePage />,
					content
				);
				break;

            /// Login
			case "login":
                // document.getElementById("sidebar-contain").classList.add('hidden');
				this.Util.setPageTitle("Log in");

				React.render(
					<LogInContainer />,
					content
				);
				break;

            /// Logout
            case "logout":

                this.Util.deleteCookie("user");

                /// Rotate to login panel with return to URI
                this.switchPage("/login");
                break;

            /// 404
			default:
				this.Util.setPageTitle("Page not found");
				Core.handleError("404");
				break;
		}

        // FIXME
        // var sidebar = document.getElementById("sidebar-contain");
        // var navItemSelected = sidebar.querySelector("li.selected");
        // var navItemNew = sidebar.querySelector("[data-location='" + action + "']");

        // if(navItemSelected != null) {
            // navItemSelected.classList.remove("selected");
        // }
        // if(navItemNew != null) {
            // navItemNew.classList.add("selected");
        // }
	},


    /**
     * Utilities object
     */
	Util: {

        /**
         * Get a cookie
         */
		getCookie: function(cname) {
		    var name = cname + "=";
		    var ca = document.cookie.split(';');
		    for(var i=0; i<ca.length; i++) {
		        var c = ca[i];
		        while (c.charAt(0)==' ') c = c.substring(1);
		        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
		    }
		    return "";
		},

        /**
         * Set a cookie
         */
        setCookie: function(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        },

        /**
         * Delete a cookie
         */
        deleteCookie: function(cname) {
            document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        },

        /**
         * DEBUG FUNCTION
         * "Flip" the canvas horizontally
         */
		flip: function() {
			document.body.classList.toggle("landscape");
		},

        /**
         * Set the page title
         */
		setPageTitle: function(title) {
			document.title = title + " | Haiti Mission Database";
		},
	},


    /**
     * User-related functions
     */
	User: {

        /// The user object receives certain
        /// user-related key/value pairs
        /// after Core.User.setup() is run


        /**
         * Check if user cookie exists
         */
		isAuthenticated: function () {
			return Core.Util.getCookie("user").length > 0;
		},

        /**
         * Set up the Core.User object
         */
        setup: function() {
            var data = JSON.parse(Core.Util.getCookie("user"));
            for(var key in data) {
                Core.User[key] = data[key];
            }

            if(Core.User.admin == 1) {
                Socket.send("bindAdmin", { name: Core.User.username });

                Socket.handle("distressBeacon", function(args) {
                    alert("Distress beacon from " + args.name + ": " + args.context);
                });
            }
        }
	}

};


/* ================================================= */

/** Extend String object with method to encode multi-byte string to utf8
 *  - monsur.hossa.in/2012/07/20/utf-8-in-javascript.html */
if (typeof String.prototype.utf8Encode == 'undefined') {
    String.prototype.utf8Encode = function() {
        return unescape( encodeURIComponent( this ) );
    };
}

/** Extend String object with method to decode utf8 string to multi-byte */
if (typeof String.prototype.utf8Decode == 'undefined') {
    String.prototype.utf8Decode = function() {
        try {
            return decodeURIComponent( escape( this ) );
        } catch (e) {
            return this; // invalid UTF-8? return as-is
        }
    };
}


/* ================================================= */

var Sha1 = {};

/**
 * Generates SHA-1 hash of string.
 *
 * @param   {string} msg - (Unicode) string to be hashed.
 * @returns {string} Hash of msg as hex character string.
 */
Sha1.hash = function(msg) {
    // convert string to UTF-8, as SHA only deals with byte-streams
    msg = msg.utf8Encode();

    // constants [§4.2.1]
    var K = [ 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6 ];

    // PREPROCESSING

    msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

    // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
    var l = msg.length/4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
    var N = Math.ceil(l/16);  // number of 16-integer-blocks required to hold 'l' ints
    var M = new Array(N);

    for (var i=0; i<N; i++) {
        M[i] = new Array(16);
        for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
            M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) |
                (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
        } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
    // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
    M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14]);
    M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;

    // set initial hash value [§5.3.1]
    var H0 = 0x67452301;
    var H1 = 0xefcdab89;
    var H2 = 0x98badcfe;
    var H3 = 0x10325476;
    var H4 = 0xc3d2e1f0;

    // HASH COMPUTATION [§6.1.2]

    var W = new Array(80); var a, b, c, d, e;
    for (var i=0; i<N; i++) {

        // 1 - prepare message schedule 'W'
        for (var t=0;  t<16; t++) W[t] = M[i][t];
        for (var t=16; t<80; t++) W[t] = Sha1.ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);

        // 2 - initialise five working variables a, b, c, d, e with previous hash value
        a = H0; b = H1; c = H2; d = H3; e = H4;

        // 3 - main loop
        for (var t=0; t<80; t++) {
            var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
            var T = (Sha1.ROTL(a,5) + Sha1.f(s,b,c,d) + e + K[s] + W[t]) & 0xffffffff;
            e = d;
            d = c;
            c = Sha1.ROTL(b, 30);
            b = a;
            a = T;
        }

        // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
        H0 = (H0+a) & 0xffffffff;
        H1 = (H1+b) & 0xffffffff;
        H2 = (H2+c) & 0xffffffff;
        H3 = (H3+d) & 0xffffffff;
        H4 = (H4+e) & 0xffffffff;
    }

    return Sha1.toHexStr(H0) + Sha1.toHexStr(H1) + Sha1.toHexStr(H2) +
           Sha1.toHexStr(H3) + Sha1.toHexStr(H4);
};


/**
 * Function 'f' [§4.1.1].
 * @private
 */
Sha1.f = function(s, x, y, z)  {
    switch (s) {
        case 0: return (x & y) ^ (~x & z);           // Ch()
        case 1: return  x ^ y  ^  z;                 // Parity()
        case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
        case 3: return  x ^ y  ^  z;                 // Parity()
    }
};

/**
 * Rotates left (circular left shift) value x by n positions [§3.2.5].
 * @private
 */
Sha1.ROTL = function(x, n) {
    return (x<<n) | (x>>>(32-n));
};


/**
 * Hexadecimal representation of a number.
 * @private
 */
Sha1.toHexStr = function(n) {
    // note can't use toString(16) as it is implementation-dependant,
    // and in IE returns signed numbers when used on full words
    var s="", v;
    for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
    return s;
};
