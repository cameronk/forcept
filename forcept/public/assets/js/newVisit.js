/**
 * newVisit.jsx
 */

/*
 * Visit container
 */
var NewVisit = React.createClass({displayName: "NewVisit",

	getInitialState: function() {
		return {
			patients: {},
		}
	},

	/*
	 * Handle addition of a new patient.
	 */
	handlePatientAdd: function(patient) {
		var patients = this.state.patients;

		if(patients.hasOwnProperty(patient.id)) {
			// Patient already in visit
		} else {
			// Update state with new patient
			patients[patient.id] = patient;
			this.setState({ patients: patients });
		}
	},

	render: function() {
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement(NewVisit.PatientsOverview, {
					fields: this.props.fields, 
					patients: this.state.patients}), 
				React.createElement(NewVisit.PatientsContainer, {
					_token: this.props._token, 
					patients: this.state.patients, 
					onPatientAdd: this.handlePatientAdd})
			)
		)
	}

});

/*
 * Patients overview (left sidebar)
 */
NewVisit.PatientsOverview = React.createClass({displayName: "PatientsOverview",

	componentWillMount: function() {

	},

	render: function() {

		console.log("Rendering patients overview with patient count " + Object.keys(this.props.patients).length);
		console.log(this.props.patients);

		var patientOverviews;
		var iterableFields = jQuery.extend({}, this.props.fields);
			delete iterableFields["first_name"];
			delete iterableFields["last_name"];

		// If there are patients in the props object
		if(Object.keys(this.props.patients).length > 0) {
			patientOverviews = Object.keys(this.props.patients).map(function(patientID, index) {
				var thisPatient = this.props.patients[patientID];
				return (
					React.createElement("div", {className: "card", key: patientID}, 
		                React.createElement("div", {className: "card-header"}, 
		                    React.createElement("span", {className: "label label-info"}, index + 1), 
		                    React.createElement("span", {className: "label label-default"}, patientID), 
		                    "  ", React.createElement("strong", null, thisPatient['full_name'] !== null ? thisPatient['full_name'] : "Unnamed patient")
		                ), 
		                React.createElement("div", {className: "list-group list-group-flush"}, 
		                    Object.keys(iterableFields).map(function(field, index) {
		                    	return (
		                    		React.createElement("a", {className: "list-group-item", key: field + "-" + index}, 
		                    			React.createElement("strong", null, iterableFields[field]["name"]), ":  ", 
		                    			thisPatient.hasOwnProperty(field) && thisPatient['field'].length > 0 ? thisPatient['field'] : "No data"
		                    		)
		                    	);
		                    })
		                )
					)
				);
			}.bind(this));
		} else {
			patientOverviews = (
				React.createElement("div", {className: "alert alert-info"}, 
					"No patients added yet."
				)
			);
		}

		return (
	        React.createElement("div", {className: "col-xs-12 col-sm-12 col-md-4 col-xl-3"}, 
	           patientOverviews
	        )
	    );
	}

});

/* 
 * Patients management (main content)
 */
NewVisit.PatientsContainer = React.createClass({displayName: "PatientsContainer",

	getInitialState: function() {
		return {
			isLoading: false
		}
	},

	isLoading: function() {
		this.setState({ isLoading: true });
	},

	isDoneLoading: function() {
		this.setState({ isLoading: false });
	},

	/*
	 * Add a bare patient record
	 */
	handlePatientAddfromScratch: function() {

		// Set state as loading
		this.isLoading();

		$.ajax({
			type: "POST",
			url: "/visit/create-patient",
			data: {
				"_token": this.props._token
			},
			success: function(resp) {
				console.log("success");
				if(resp.status == "success") {
					this.props.onPatientAdd(resp.patient);
				}
			}.bind(this),
			error: function(resp) {
				// console.log("success");
				// console.log(resp);
			},
			complete: function() {
				this.isDoneLoading();
			}.bind(this)
		});

	},

	render: function() {

		console.log("Rendering patients container with patients " + Object.keys(this.props.patients).length);
		console.log(this.props.patients);
		var patients;

		if(Object.keys(this.props.patients).length > 0) {
			patients = (Object.keys(this.props.patients)).map(function(patientID, index) {
				return (
					React.createElement(NewVisit.Patient, React.__spread({},  
						this.props.patients[patientID], 
						{id: patientID, 
						index: index, 
						key: patientID}))
				);
			}.bind(this));
		} else {
			patients = (
				React.createElement("div", {className: "alert alert-info"}, 
					"No patients added yet. Add one by choosing an option below."
				)
			);
		}

		var loadingGifClasses = ("m-x" + (this.state.isLoading == false ? " invisible" : ""));

		return (
			React.createElement("div", {className: "col-xs-12 col-sm-12 col-md-8 col-xl-9"}, 
	            React.createElement("h1", {className: "p-t"}, "New visit"), 
	            React.createElement("hr", null), 
	            patients, 
	            React.createElement("hr", null), 
	            React.createElement("div", {className: "btn-group btn-group-lg"}, 
	            	React.createElement("button", {type: "button", className: "btn btn-primary", disabled: this.state.isLoading, onClick: this.handlePatientAddfromScratch}, "Create new patient record"), 
	            	React.createElement("img", {src: "/assets/img/loading.gif", className: loadingGifClasses, width: "52", height: "52"})
	            )
	        )
		);
	}
});
