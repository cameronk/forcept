/**
 * utilities/XMLHttpRequest.jsx
 * @author Cameron Kelley
 */

var Request = {

    /*
     * Return a semantic error object for
     * usage in more detailed error messages.
     */
    getSemanticError: function(xhr) {
        console.log("getSemanticError: %O", xhr);
        var message = {
            summary: "An error occurred.",
            details: "",
        };

        if(xhr.hasOwnProperty("responseJSON")
            && xhr.responseJSON.hasOwnProperty("message")
            && xhr.responseJSON.message.toString().length > 0) {

            message.details = xhr.responseJSON.message + ".";

            for(var key in xhr.responseJSON) {
                message[key] = xhr.responseJSON[key];
            }

        } else {
            switch(xhr.readyState) {
                case 0:

                    message.summary  = "Unable to send request.";
                    message.allowRetry = true;

                    if(xhr.status === 0) {
                        message.details = "It looks like your internet was disconnected, or the operation timed out. Please ensure your connection is established and try again.";
                    } else {
                        message.details = "Your internet may have been disconnected, or an internal error may have occurred. Please ensure your connection is established and try again.";
                    }

                    break;
            };
        }

        return {
            readyState: xhr.readyState,
            status: xhr.status,
            response: message
        };

    },

    /*
     *
     */
    fatal: function(xhr) {
        return xhr.readyState === 0;
    },

    /*
     *
     */
    abort: function(error, onClose) {

        /*
         * Grab semantic error and set default onClose
         * as an empty function.
         */
        error   = this.getSemanticError(error),
        onClose = onClose || function() { };

        ReactDOM.render(
            React.createElement(
                Modals.Abort,
                {
                    error: error,
                    onClose: onClose
                }
            ),
            document.getElementById('forcept-modal-container')
        );

    }
};
