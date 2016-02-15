/**
 * Forcept.jsx
 */

/*
 * Add debug data to tooltip
 */
function __debug() {
	var compile = "";
	for(var i = 0; i < arguments.length; i++) {
		var data = arguments[i];
		if(typeof data == "object" && data !== null) {
			data = JSON.stringify(data, null, "  ");
		}
		compile += (data + "<br/><br/>");
	}
	$("#forcept-debug-content pre").html(compile);
}

function isTrue(statement) {
	switch(typeof statement) {
		case "boolean":
			return statement === true;
		case "string":
			return statement === "true";
		default:
			return false;
	}
}

function base64bytes(string) {
	var splitHeadAndData = string.split(',');
	return Math.round( (splitHeadAndData[1].length - splitHeadAndData[0].length) * 0.75 );
}

function getFileSize(n,a,b,c,d){
	return (a=a?[1e3,'k','B']:[1024,'K','iB'],b=Math,c=b.log,
	d=c(n)/c(a[0])|0,n/b.pow(a[0],d)).toFixed(2)
	+' '+(d?(a[1]+'MGTPEZY')[--d]+a[2]:'Bytes');
}


var Utilities = {

	/*
	 * Calculate aged based on a given date
	 */
	calculateAge: function(date) {
		// Setup date objects
		var birthday = +new Date(date),
			now = Date.now(),
			age = null;

		// Make sure the birthday is in the past
		if(birthday < now) {

			// Start by trying to calculate in years
			var years = ~~((now - birthday) / (31557600000)); // 24 * 3600 * 365.25 * 1000

			// If the birthday is < 1 year, use months
			if(years === 0) {
				var months = ((now - birthday) / (2629800000)); // 24 * 3600 * 365.25 * 1000 all over 12
				age = ~~months !== 0 ? months.toFixed(1) + " months" : "<1 month"; // If <1 month, show "<1" instead of zero
			} else {
				age = years + " years";
			}

		}

		return age;
	},


	/*
	 * Handle automatic generation of field data
	 */
	applyGeneratedFields: function( patient ) {

		// Patient full name
		var fullName = null;
		var abbrName = null;

		if(
			typeof patient.first_name === "string"
			&& typeof patient.last_name === "string"
			&& patient.first_name.length > 0
			&& patient.last_name.length > 0
		) {
			fullName = patient.first_name + " " + patient.last_name;
			abbrName = patient.first_name[0].toUpperCase() + " " + patient.last_name;
		} else {
			fullName = "Unnamed Patient";
			abbrName = "Unnamed Patient";
			if(typeof patient.first_name === "string" && patient.first_name.length > 0 ) {
				fullName = patient.first_name;
				abbrName = patient.first_name;
			}
			if(typeof patient.last_name === "string" && patient.last_name.length > 0) {
				fullName = patient.last_name;
				abbrName = patient.last_name;
			}
		}

		patient.full_name = fullName;
		patient.abbr_name = abbrName;


		// Age
		var age = null,
			birthday = patient.birthday;
		if(
			typeof birthday === "string"
			&& birthday.length > 0
		) {
			age = Utilities.calculateAge(birthday);
		}

		patient.age = age;

		// Return patient object
		return patient;
	},

	/*
	 * Get full name of patient (or "Unnamed Patient") if none defined
	 */
	getFullName: function(thisPatient) {
		if(thisPatient.hasOwnProperty('full_name') && thisPatient.full_name !== null && thisPatient.full_name.length > 0) {
			return thisPatient.full_name;
		} else {
			// Try to buiild one
			var checkName = [];
			if(thisPatient.hasOwnProperty("first_name") && thisPatient.first_name !== null && thisPatient.first_name.length > 0) {
				checkName.push(thisPatient.first_name);
			}
			if(thisPatient.hasOwnProperty("last_name") && thisPatient.last_name !== null && thisPatient.last_name.length > 0) {
				checkName.push(thisPatient.last_name);
			}

			return checkName.length > 0 ? checkName.join(" ") : "Unnamed Patient";
		}
	},

	timeAgo: function(time) {
			var units = [
			{ name: "second", limit: 60, in_seconds: 1 },
			{ name: "minute", limit: 3600, in_seconds: 60 },
			{ name: "hour", limit: 86400, in_seconds: 3600  },
			{ name: "day", limit: 604800, in_seconds: 86400 },
			{ name: "week", limit: 2629743, in_seconds: 604800  },
			{ name: "month", limit: 31556926, in_seconds: 2629743 },
			{ name: "year", limit: null, in_seconds: 31556926 }
		];
		var diff = (new Date() - new Date(time*1000)) / 1000;
		if (diff < 5) return "now";

		var i = 0, unit;
		while (unit = units[i++]) {
			if (diff < unit.limit || !unit.limit){
				var diff =  Math.floor(diff / unit.in_seconds);
				return diff + " " + unit.name + (diff>1 ? "s" : "");
			}
		};
	},

	/*
	 * Eloquent returns some boolean fields as strings.
	 * Use this function to check if a statement is true.
	 * if the value is (string) "true" : (string) "false"
	 */
	isTrue: function(statement) {
		switch(typeof statement) {
			case "boolean":
				return statement === true;
			case "string":
				return statement === "true";
			default:
				return false;
		}
	},
};
