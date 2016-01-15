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
		if(
			typeof patient.first_name === "string"
			&& typeof patient.last_name === "string"
			&& patient.first_name.length > 0
			&& patient.last_name.length > 0
		) {
			fullName = patient.first_name + " " + patient.last_name;
		} else {
			if(typeof patient.first_name === "string" && patient.first_name.length > 0 ) {
				fullName = patient.first_name;
			}
			if(typeof patient.last_name === "string" && patient.last_name.length > 0) {
				fullName = patient.last_name;
			}
		}

		patient.full_name = fullName;


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
		return thisPatient.full_name !== null && thisPatient.full_name.length > 0 ? thisPatient.full_name : "Unnamed patient";
	},
};

/* ========================================= */

var Fields = {
	labelColumnClasses: "col-lg-4 col-sm-5 col-xs-12",
	inputColumnClasses: "col-lg-8 col-sm-7 col-xs-12"
};

Fields.FieldLabel = React.createClass({
	render: function() {
		var description;
		if(this.props.hasOwnProperty("description") && this.props.description !== null && this.props.description.length > 0) {
			description = (
				<div>
					<small className="text-muted">
						{this.props.description}
					</small>
				</div>
			);
		}
		return (
			<label htmlFor={this.props.id} className={Fields.labelColumnClasses + " form-control-label"}>
				{this.props.name}
				{description}
			</label>
		)
	}
})

Fields.Text = React.createClass({
	onTextInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<input
						type="text"
						className="form-control"
						autoComplete="off"
						maxLength="255"

						id={this.props.id}
						placeholder={this.props.name + " goes here"}
						defaultValue={this.props.defaultValue !== null ? this.props.defaultValue : null}
						onChange={this.onTextInputChange} />
				</div>
			</div>
		);
	}
});

Fields.Textarea = React.createClass({
	onTextareaInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<textarea
						className="form-control"
						autoComplete="off"
						maxLength="255"

						id={this.props.id}
						placeholder={this.props.name + " goes here"}
						defaultValue={this.props.defaultValue !== null ? this.props.defaultValue : null}
						onChange={this.onTextareaInputChange} />
				</div>
			</div>
		);
	}
});

Fields.Number = React.createClass({
	onNumberInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<input
						type="number"
						className="form-control"
						autoComplete="off"
						maxLength="255"

						id={this.props.id}
						placeholder={this.props.name + " goes here"}
						defaultValue={this.props.defaultValue !== null ? this.props.defaultValue : null}
						onChange={this.onNumberInputChange} />
				</div>
			</div>
		);
	}
});

Fields.Date = React.createClass({
	onDateInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<input
						type="date"
						className="form-control"
						autoComplete="off"
						maxLength="255"

						id={this.props.id}
						placeholder={this.props.name + " goes here"}
						defaultValue={this.props.defaultValue !== null ? this.props.defaultValue : null}
						onChange={this.onDateInputChange} />
				</div>
			</div>
		);
	}
});

Fields.Select = React.createClass({

	getInitialState: function() {
		return {
			isCustomDataOptionSelected: false
		};
	},

	onSelectInputChange: function(event) {

		var props = this.props;

		// Is this a multiselect input?
		if(props.multiple == true) {

			var options = event.target.options,
				values = [];

			for(var i = 0; i < options.length; i++) {
				if(options[i].selected) {
					values.push(options[i].value);
				}
			}

			props.onChange(props.id, values);

		} else {
			// Check value before bubbling.
			switch(event.target.value) {
				case "__default__":
					// Spoof event target value
					this.setState({ isCustomDataOptionSelected: false });
					props.onChange(props.id, "");
					break;
				case "__custom__":
					// Set top-level state value to nothing (so it says "No data")
					this.setState({ isCustomDataOptionSelected: true });
					props.onChange(props.id, "");
					break;
				default:
					// Bubble event up to handler passed from Visit
					// (pass field ID and event)
					this.setState({ isCustomDataOptionSelected: false });
					props.onChange(props.id, event.target.value);
					break;
			}
		}
	},

	onCustomDataInputChange: function(event) {
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {

		var props = this.props,
			state = this.state,
			options,
			optionsKeys,
			optionsDOM,
			displaySelect,
			defaultOption,
			customDataOption,
			customDataInput;

		if(props.settings.hasOwnProperty('options')) {
			options = props.settings.options;
			optionsKeys = Object.keys(options);
		} else {
			options = {};
			optionsKeys = [];
		}

		// Default option (prepended to select)
		if(props.multiple == false) {

			defaultOption = (
				<option value="__default__" disabled="disabled">Choose an option&hellip;</option>
			);

			// Custom data option (appended to select IF allowCustomData is set)
			if(isTrue(props.settings.allowCustomData)) {
				customDataOption = (
					<option value="__custom__">Enter custom data for this field &raquo;</option>
				);
			}

			// Custom data input (show if custom data option select state is true)
			if(isTrue(state.isCustomDataOptionSelected)) {
				customDataInput = (
					<input type="text" className="form-control" placeholder="Enter custom data here" onChange={this.onCustomDataInputChange} />
				);
			}
		}

		// Loop through and push options to optionsDOM
		optionsDOM = optionsKeys.map(function(optionKey, index) {
			var disabled = false,
				thisOption = props.settings.options[optionKey];
			if(thisOption.hasOwnProperty('available')) {
				disabled = (thisOption.available === "false");
			}
			return (
				<option value={options[optionKey].value} key={this.props.id + "-option-" + index} disabled={disabled}>
					{options[optionKey].value}
				</option>
			);
		}.bind(this));

		// Set size if this is a multiselect input
		var size = props.multiple ? (optionsKeys.length > 30 ? 30 : optionsKeys.length ) : 1;

		// Build the select input
		displaySelect = (
			<select
				className="form-control"
				onChange={this.onSelectInputChange}
				defaultValue={props.defaultValue !== null ? props.defaultValue : (props.multiple ? [] : "__default__")}
				multiple={props.multiple}
				size={size}>
					{defaultOption}
					{optionsDOM}
					{customDataOption}
			</select>
		);

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					{displaySelect}
					{customDataInput}
				</div>
			</div>
		);
	}
});

Fields.File = React.createClass({
	getInitialState: function() {
		return {
			isUploading: false,	// Are we uploading to the server?
			isParsing: false, 	// Are we parsing the file?
			resources: [], 		// Already-uploaded objects
			files: [],			// Files pending upload
			uploadProgress: 0,	// Progress percentage of the current upload
			status: "",
			message: "",
			_storage: {},		// Store resources by their ID
		};
	},

	componentWillMount: function() {
		var props = this.props;
		if(props.hasOwnProperty("defaultValue") && props.defaultValue !== null) {
			this.setState({
				resources: props.defaultValue
			});
		}
	},

	onFileInputChange: function(event) {

		// Remove any previous messages
		this.setState({
			status: "",
			message: "",
			isParsing: true
		});

		var files = event.target.files,
			filesLength = files.length,
			modifiedFiles = [],
			done = function() {
				console.log("[Fields.File] modifiedFiles count: " + modifiedFiles.length);
				this.setState({
					files: modifiedFiles,
					isParsing: false
				});
			}.bind(this);

		setTimeout(function() {
			for(var i = 0; i < filesLength; i++) {
				var thisFile = files[i],
					reader = new FileReader(),
					n = i;

				console.log("[Fields.File] working with file " + i);

				if(thisFile.type.match('image.*')) {

					var maxWidth = (this.props.hasOwnProperty("maxWidth") ? this.props.maxWidth : 310),
						maxHeight = (this.props.hasOwnProperty("maxHeight") ? this.props.maxHeight : 310);

					// onLoad: reader
					reader.onload = function(readerEvent) {

						console.log("[Fields.File][" + n + "] caught reader.onload");

						// Create a new image and load our data into it
						var image = new Image();

						// onLoad: image
						image.onload = function(imageEvent) {

							console.log("[Fields.File][" + n + "] caught image.onload");

							// Setup canvas element, grab width/height of image
							var canvas = document.createElement("canvas"),
								width = image.width,
								height = image.height;

							// Figure out what our final width / height should be
							if (width > height) {
								if (width > maxWidth) {
									height *= maxWidth / width;
									width = maxWidth;
								}
							} else {
								if (height > maxHeight) {
									width *= maxHeight / height;
									height = maxHeight;
								}
							}

							// Size our canvas appropriately
							canvas.width = width;
							canvas.height = height;

							console.log("[Fields.File][" + n + "] " + width + "x" + height);

							// Push image to canvas context
							canvas.getContext("2d").drawImage(image, 0, 0, width, height);

							console.log("[Fields.File][" + n + "] image/jpeg @ 0.5 is:");
							console.log(canvas.toDataURL("image/jpeg", 0.5));

							modifiedFiles[n] = canvas.toDataURL("image/jpeg", 0.5);

							if((n + 1) == filesLength) {
								done();
							}
						};

						image.src = readerEvent.target.result;

					};

					reader.readAsDataURL(thisFile);

				} else {
					reader.onload = function(evt) {
						modifiedFiles[n] = evt.target.result;
					};

					reader.readAsDataURL(thisFile);
				}

			}
		}.bind(this), 100);
	},

	/*
	 *
	 */
	handleUploadFiles: function() {
		// Set state as uploading this file.
		this.setState({
			isUploading: true,
			status: "",
			statusMessage: ""
		});

		var data = {},
			state = this.state;

		// Push all files loaded as inputs
		for(var i = 0; i < state.files.length; i++) {
			console.log("[Fields.File](handleUploadFiles) file " + i + " has data");
			console.log(state.files[i]);
			data["file-" + i] = state.files[i];
		}

		// Add CSRF token.
		data._token = document.querySelector("meta[name='csrf-token']").getAttribute('value');

		$.ajax({
			type: "POST",
			url: "/data/resources/upload",
			data: data,
			xhr: function() {
				var xhr = new window.XMLHttpRequest();

				// TODO fix this
				xhr.addEventListener("progress", function(evt) {
					if(evt.lengthComputable) {
						var progress = Math.round(evt.loaded / evt.total);
						console.log("[Fields.File]->handleUploadFiles(): progress=" + progress);
						this.setState({
							uploadProgress: progress
						});
					}
		       }.bind(this), false);

				return xhr;

			}.bind(this),
			success: function(resp) {
				var resources = resp.hasOwnProperty("message") && typeof resp.message === "object" && resp.message !== null ? resp.message : {};
				var resourceKeys = Object.keys(resources);
				this.setState({
					isUploading: false,
					uploadProgress: 0,
					files: [],
					resources: resourceKeys,
					_storage: resources,
					status: "success",
					message: "File(s) uploaded successfully!"
				}, function() {
					var props = this.props;
					props.onChange(props.id, resourceKeys);
					for(i = 0; i < resourceKeys.length; i++) {
						var k = resourceKeys[i];
						props.onStore(k, resources[k]);
					}
				}.bind(this));
			}.bind(this),
			error: function(resp) {
				this.setState({
					isUploading: false,
					uploadProgress: 0,
					status: "failure",
					message: "An error occurred during upload."
				});
			}.bind(this)
		});

	},

	handleRemoveResource: function(resourceID) {
		var storage = this.state._storage,
			resources = this.state.resources,
			index = resources.indexOf(resourceID);

		if(storage.hasOwnProperty(resourceID)) {
			delete storage[resourceID];
		}
		if(index !== -1) {
			resources.splice(index, 1);
		}

		this.setState({
			resources: resources,
			_storage: storage,
			status: "",
			message: ""
		}, function() {
			this.props.onChange(this.props.id, resources);
		}.bind(this));
	},

	render: function() {
		var props = this.props,
			state = this.state,
			settings = props.settings,
			accept = "",
			files = this.state.files,
			filesCount = files.length,
			resources = this.state.resources,
			storage = this.state._storage,
			resourcesCount = resources.length,
			fileDisplay,
			statusMessage;

		// If we have an accept array, join it
		if(settings.hasOwnProperty("accept")) {
			accept = settings.accept.join();
		}

		if(state.status.length > 0 && state.message.length > 0) {
			var type = (state.status == "success" ? "success" : (state.status == "failure" ? "danger" : "info"));
			statusMessage = (
				<div className={"alert alert-" + type}>
					<small>{state.message}</small>
				</div>
			);
		}

		// Figure out what to display.
		if(resourcesCount > 0) {
			// We have resources - don't show file input.
			var fileList = resources.map(function(resource, index) {
				return (
					<div className="list-group-item" key={["file-", resource, "-", index].join()}>
						<small>#{resource} - {storage[resource].type}</small>
						<button onMouseUp={this.handleRemoveResource.bind(this, resource)} className="close pull-right">
							&times;
						</button>
					</div>
				);
			}.bind(this));

			fileDisplay = (
				<div className="card">
					<ul className="list-group list-group-flush">
						{fileList}
					</ul>
				</div>
			)
		} else {
			// Check if we're currently uploading
			if(!state.isUploading) {
				// No resources found - show file input.
				var uploadButton;

				if(filesCount > 0 || state.isParsing) {
					uploadButton = (
						<div>
							<button type="button" disabled={state.isParsing} className="btn btn-sm btn-primary btn-block" onClick={this.handleUploadFiles}>
								{'\u21d1'} {state.isParsing ? "Preparing files..." : "Upload"}
							</button>
						</div>
					);
				}

				fileDisplay = (
					<div>
						<label className="file">
							<input type="file" className="form-control" accept={accept} onChange={this.onFileInputChange} />
							<span className="file-custom">
								{filesCount > 0 ? filesCount + " files - " : ""}
							</span>
						</label>
						{uploadButton}
					</div>
				);
			} else {
				// No resources found - show file input.
				fileDisplay = (
					<div>
						<h6 className="text-muted text-center m-t">
							Uploading {filesCount} {filesCount === 1 ? "file" : "files"}...
						</h6>
						<progress className="progress" value={state.uploadProgress} max={100}>
							<div className="progress">
								<span className="progress-bar" style={{ width: state.uploadProgress + "%" }}>
									{state.uploadProgress}%
								</span>
							</div>
						</progress>
					</div>
				);
			}

		}

		// <h6>{this.state.fileSize > 0 ? getFileSize(this.state.fileSize) : ""}</h6>
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					{fileDisplay}
					{statusMessage}
				</div>
			</div>
		);
	}
});

Fields.YesNo = React.createClass({

	getInitialState: function() {
		return {
			yes: null,
		};
	},

	componentWillMount: function() {

		var props = this.props;

		// If data, set
		if(props.hasOwnProperty('defaultValue')
			&& props.defaultValue !== null
			&& ["yes", "no"].indexOf(props.defaultValue.toLowerCase()) !== -1) {
			this.setState({
				yes: props.defaultValue.toLowerCase() == "yes"
			});
		}
	},

	onYesNoInputChange: function(status) {
		return function(evt) {
			console.log("Caught yes/no input change -> " + status);

			this.setState({
				yes: status
			});

			this.props.onChange(this.props.id, status ? "Yes" : "No");

		}.bind(this);
	},

	render: function() {

		var props = this.props,
			state = this.state;

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					<div className="btn-group btn-group-block" data-toggle="buttons">
						<label className={"btn btn-primary-outline" + (state.yes == true ? " active" : "")} onClick={this.onYesNoInputChange(true)}>
							<input type="radio"
								name={props.name + "-options"}
								autoComplete="off"

								defaultChecked={state.yes == true} />
							Yes
						</label>
						<label className={"btn btn-primary-outline" + (state.yes == false ? " active" : "")} onClick={this.onYesNoInputChange(false)} >
							<input type="radio"
								name={props.name + "-options"}
								autoComplete="off"

								defaultChecked={state.yes == false} />
							No
						</label>
					</div>
				</div>
			</div>
		);
	}
});

Fields.Header = React.createClass({
	render: function() {
		var description,
			props = this.props;
		if(props.hasOwnProperty('description') && description !== null) {
			description = (
				<small className="text-muted">{props.description}</small>
			);
		}
		return (
			<div className="form-group row">
				<h3 className="forcept-fieldset-header">{props.name} {description}</h3>
				<hr/>
			</div>
		);
	}
});

Fields.Pharmacy = React.createClass({
	getInitialState: function() {
		return {
			data: {}
		};
	},
	updateList: function() {
		$.ajax({
			type: "GET",
			url: "/data/pharmacy/drugs",
			success: function(resp) {
				if(resp.status == "success") {
					__debug(resp.data);
					this.setState({
						data: resp.data
					});
				}
			}.bind(this),
			error: function() {

			},
			complete: function() {

			}
		});
	},
	componentWillMount: function() {
		this.updateList();
	},

	onSelectedDrugsChange: function(event) {
		console.log("Selected drugs change:");
		var options = event.target.options,
			values = [];

		for(var i = 0; i < options.length; i++) {
			if(options[i].selected) {
				values.push(options[i].value);
			}
		}
		console.log(values);
		this.props.onChange(this.props.id, values);
	},

	render: function() {
		var props = this.props,
			state = this.state,
			dataKeys = Object.keys(this.state.data);

		var selectDrugs = (
			<div className="alert alert-info">
				<strong>One moment...</strong><div>loading the latest pharmacy data</div>
			</div>
		);

		if(dataKeys.length > 0) {
			selectDrugs = (
				<select
					className="form-control forcept-field-select-drugs"
					multiple={true}
					size={10}
					onChange={this.onSelectedDrugsChange}>

					{dataKeys.map(function(drugKey, index) {
						var thisCategory = state.data[drugKey];

						if(thisCategory.hasOwnProperty('settings')
							&& thisCategory.settings.hasOwnProperty('options')
							&& thisCategory.settings.options !== null) {

							var optionKeys = Object.keys(thisCategory.settings.options);

							return (
								<optgroup key={thisCategory.name} label={thisCategory.name}>
									{optionKeys.map(function(optionKey, optionIndex) {

										var thisOption = thisCategory.settings.options[optionKey],
											disabled = thisOption.available == "false",
											displayName = thisOption.value + (parseInt(thisOption.count) > 0 && thisOption.available ? "\u2014 " + thisOption.count : "")

										if(!disabled) {
											return (
												<option value={thisOption.value} key={optionIndex}>
													{displayName}
												</option>
											);
										}

									}.bind(this))}
								</optgroup>
							);
						}
					}.bind(this))}
				</select>
			);
		}

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					{selectDrugs}
				</div>
			</div>
		);
	}
});


Fields.Resource = React.createClass({
	getInitialState: function() {
		return {
			isFetching: false,
			resource:{}
		};
	},
	componentWillMount: function() {

		var props = this.props;

		if(props.hasOwnProperty('resource')
		&& props.resource !== null
		&& typeof props.resource === "object") {

			if(!props.resource.hasOwnProperty('data')) {
				// No data found for this resource. We must load it.
				this.fetchData();
			}

			this.setState({
				resource: props.resource
			});
		}
	},

	fetchData: function() {

		var props = this.props,
			state = this.state;

		console.log("[Fields.Resource][" + props.id + "]: fetching data");
		this.setState({
			isFetching: true,
		});

		$.ajax({
			method: "GET",
			url: "/data/resources/fetch?id=" + props.id,
			success: function(resp) {
				var resource = state.resource;
					resource['type'] = resp.type;
					resource['base64'] = resp.base64;

				this.setState({
					isFetching: false,
					resource: resource
				});
			}.bind(this),
			error: function(resp) {

			}.bind(this),
		});
	},

	render: function() {

		var props = this.props,
			state = this.state;
			resource = state.resource;

		var renderResource;
		var loading = function() {
			renderResource = "Loading";
		};


		console.log("[Fields.Resource][" + props.id + "]->render() with state:");
		console.log(state);

		if(resource !== null && typeof resource === "object") {

			if(state.isFetching) {
				loading();
			} else {
				if(resource.hasOwnProperty('type')) {
					var type = resource.type;
					if(type.match("image/*")) {
						console.log("[Fields.Resource][" + props.id + "]: type matches image");

						if(resource.hasOwnProperty('base64')) {
							try {
								renderResource = (
									<img src={resource.base64} />
								);
							} catch(e) {
								renderResource = "error!";
							}
						} else {
							// Haven't fetched yet
							loading();
						}

					} else {
						// renderResource = (
						//
						// );
					}
				}
			}
		}

		return (
			<div className={"forcept-patient-photo-contain " + (props.hasOwnProperty("className") ? props.className : "")}>
				{renderResource}
			</div>
		);
	},
});
