/**
 * verbiage/Verbiage.jsx
 */

var Verbiage = {

    language: "EN",

    Statements: {

        Request: {

            Errors: {

            }
            
        }

    },

    getStatement: function(statement, replace) {

        /*
         * Make sure we have a statment identifier
         */
        if(typeof statement !== "string" || statement.length === 0)
            return "";

        var identifier = arguments[0].split("."),
            statement = this.Statements;

        for(var i = 0; i < identifier.length; i++) {
            var id = identifier[i];
            if(statement.hasOwnProperty(id)) {
                statement = statement[id];
            } else break;
        }

        return (typeof replace === "object" && replace !== null) ? statement[this.language].format(replace) : statement[this.language];

    }
};
