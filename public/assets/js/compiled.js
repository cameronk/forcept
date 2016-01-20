/**
 * data-displays/DataDisplays.jsx
 */

var DataDisplays = {
	setupDates: function(module) {
		var oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		module.setState({
			from: oneWeekAgo.toISOString().split(".")[0],
			to: new Date().toISOString().split(".")[0]
		}, function() {
			module.update();
		});
	}
};

DataDisplays.RangeModule = React.createClass({displayName: "RangeModule",

	render: function() {
		return (
			React.createElement("div", {className: "row date-range"}, 
				React.createElement("div", {className: "col-xs-12 col-sm-6"}, 
					React.createElement("div", {className: "input-group"}, 
						React.createElement("span", {className: "input-group-addon"}, "From"), 
						React.createElement("input", {type: "datetime-local", className: "form-control", placeholder: "Date", value: this.props.from, onChange: this.props.onChangeFrom})
					)
				), 
				React.createElement("div", {className: "col-xs-12 col-sm-6"}, 
					React.createElement("div", {className: "input-group"}, 
						React.createElement("span", {className: "input-group-addon"}, "To"), 
						React.createElement("input", {type: "datetime-local", className: "form-control", placeholder: "Date", value: this.props.to, onChange: this.props.onChangeTo})
					)
				)
			)
		);
	}
});


/*
 * Flow Overview
 *
 * Properties:
 *
 */
DataDisplays.FlowOverview = React.createClass({displayName: "FlowOverview",

	getInitialState: function() {
		return {
			stages: {}
		};
	},

	update: function() {
		$.ajax({
			type: "GET",
			url: "/data/visits/count",
			data: {
				from: this.state.from,
				to: this.state.to
			},
			success: function(resp) {
				this.setState({
					stages: resp.stages,
				});
			}.bind(this),
			error: function(resp) {

			},
			complete: function(resp) {
			}
		});
	},

	componentWillMount: function() {
		DataDisplays.setupDates(this);
	},

	changeFromDate: function(event) {
		this.setState({
			from: event.target.value
		});
	},

	changeToDate: function(event) {
		this.setState({
			to: event.target.value
		});
	},

	render: function() {
		return (
			React.createElement("blockquote", {className: "blockquote", id: "display-flow-overview"}, 
				React.createElement("h2", null, "Flow overview"), 
				React.createElement("hr", null), 
				React.createElement("div", {className: "row"}, 
					Object.keys(this.state.stages).map(function(stageID, index) {
						return (
							React.createElement("div", {className: "col-xs-12 col-sm-6 col-md-4", key: "flow-overview-stage-" + index}, 
								React.createElement("div", {className: "card"}, 
									React.createElement("div", {className: "card-block"}, 
										React.createElement("h4", {className: "card-title text-xs-center m-b"}, 
											this.state.stages[stageID].name
										), 
										React.createElement("hr", null), 
										React.createElement("div", {className: "row"}, 
											React.createElement("div", {className: "col-xs-12 col-sm-6 text-xs-center"}, 
												React.createElement("h2", null, React.createElement("span", {className: "label label-primary label-rounded"}, this.state.stages[stageID]['visits'])), 
												React.createElement("h5", {className: "text-muted"}, "visit", this.state.stages[stageID]['visits'] == 1 ? "" : "s")
											), 
											React.createElement("div", {className: "col-xs-12 col-sm-6 text-xs-center"}, 
												React.createElement("h2", null, React.createElement("span", {className: "label label-primary label-rounded"}, this.state.stages[stageID]['patients'])), 
												React.createElement("h5", {className: "text-muted"}, "patient", this.state.stages[stageID]['patients'] == 1 ? "" : "s")
											)
										)
									)
								)
							)
						);
					}.bind(this))
				), 
				React.createElement("hr", null), 
				React.createElement(DataDisplays.RangeModule, {
					from: this.state.from, 
					to: this.state.to, 
					onChangeFrom: this.changeFromDate, 
					onChangeTo: this.changeToDate})
			)
		);

	}

});


DataDisplays.PatientAggregate = React.createClass({displayName: "PatientAggregate",

	getInitialState: function() {
		return {
			stages: [],
			charts: {}
		};
	},

	update: function() {
		$.ajax({
			type: "GET",
			url: "/data/patients/count",
			data: {
				from: this.state.from,
				to: this.state.to
			},
			success: function(resp) {
				console.log("Success");
				console.log(resp);

				var charts = {};
				resp.stages.map(function(stage) {
					// console.log(stage);
					for(var fieldID in stage.data) {

						var dataArray = [];
						for(var dataKey in stage.data[fieldID]) {
							dataArray.push(stage.data[fieldID][dataKey]);
						}

						charts[fieldID] = {
							chart: {
								type: 'bar',
							},
					        title: {
					            text: 'Fruit Consumption'
					        },
							xAxis: {
								categories: Object.keys(stage.data[fieldID])
							},
							yAxis: {
					            title: {
					                text: 'Fruit eaten'
					            }
					        },
							series: [{
								name: 'Series 1',
								data: dataArray
							}]
						};
					}
				});

				this.setState({
					stages: resp.stages,
					charts: charts
				});

			}.bind(this),
			error: function(resp) {

			},
			complete: function(resp) {
			}
		});
	},

	componentWillMount: function() {
		DataDisplays.setupDates(this);
	},

	componentDidMount: function() {
		this.renderCharts();
	},
	componentDidUpdate: function() {
		this.renderCharts();
	},

	changeFromDate: function(event) {
		this.setState({
			from: event.target.value
		});
	},

	changeToDate: function(event) {
		this.setState({
			to: event.target.value
		});
	},

	renderCharts: function() {
		setTimeout(function() {
			for(var domID in this.state.charts) {
				console.log("Rendering chart " + domID);
				console.log(this.state.charts[domID]);
				$("#datadisplays-patient-aggregate-field-" + domID).highcharts(this.state.charts[domID]);
			}
		}.bind(this), 5000);
	},

	render: function() {

		console.log(this.state);

		var data;


		if(this.state.stages.length > 0) {
			data = (
				React.createElement("div", {className: "row"}, 
					this.state.stages.map(function(stage, index) {
						return (
							React.createElement("div", {className: "col-xs-12 col-sm-6 col-md-4 col-lg-3", key: "patient-aggregate-stage-" + index}, 
								React.createElement("div", {className: "card"}, 
									React.createElement("div", {className: "card-block"}, 
										React.createElement("h4", {className: "card-title text-xs-center"}, 
											stage.name
										)
									), 
									React.createElement("ul", {className: "list-group list-group-flush"}, 
										Object.keys(stage.data).map(function(fieldID) {
											var dataSet = stage.data[fieldID];
											return (
												React.createElement("li", {className: "list-group-item data-points-list", key: "patient-aggregate-field-" + fieldID}, 
													React.createElement("ul", {className: "list-unstyled"}, 
														React.createElement("li", {className: "bg-secondary"}, 
															React.createElement("h6", {className: "m-a-0"}, 
																stage.fields[fieldID].name
															)
														), 
														Object.keys(dataSet).map(function(dataPoint) {
															var point;
															if(dataPoint.length > 0) {
																point = dataPoint;
															} else {
																point = (
																	React.createElement("em", null, "No data")
																);
															}
															return (
																React.createElement("li", {className: "data-point-list-item text-xs-left"}, 
																	point, 
																	React.createElement("span", {className: "label label-primary pull-right"}, 
																		dataSet[dataPoint]
																	)
																)
															);
														})
													)
												)
											);
										}.bind(this))
									)
								)
							)
						);
					}.bind(this))
				)
			);
		} else {
			data = (
				React.createElement("div", {className: "alert alert-info"}, 
					"No data found for this display within the specified time range."
				)
			);
		}

		return (
			React.createElement("blockquote", {className: "blockquote"}, 
				React.createElement("h2", null, "Patient aggregate data by stage"), 
				React.createElement("hr", null), 
				data, 
				React.createElement("hr", null), 
				React.createElement(DataDisplays.RangeModule, {
					from: this.state.from, 
					to: this.state.to, 
					onChangeFrom: this.changeFromDate, 
					onChangeTo: this.changeToDate})
			)
		);
	},

});

/* ========================================= */

/**
 * fields/Fields.jsx
 * @author Cameron Kelley
 */

var Fields = {
	labelColumnClasses: "col-lg-4 col-sm-5 col-xs-12",
	inputColumnClasses: "col-lg-8 col-sm-7 col-xs-12"
};

Fields.FieldLabel = React.createClass({displayName: "FieldLabel",
	render: function() {
		var description;
		if(this.props.hasOwnProperty("description") && this.props.description !== null && this.props.description.length > 0) {
			description = (
				React.createElement("div", null, 
					React.createElement("small", {className: "text-muted"}, 
						this.props.description
					)
				)
			);
		}
		return (
			React.createElement("label", {htmlFor: this.props.id, className: Fields.labelColumnClasses + " form-control-label"}, 
				this.props.name, 
				description
			)
		)
	}
});

/**
 * fields/Date.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - settings:
 *   - useBroadMonthSelector: if true, show a basic month selector instead of date input
 */
 Fields.Date = React.createClass({displayName: "Date",

	getInitialState: function() {
		return {
			broadMonthDetractor: null
		};
	},

	onBroadMonthSelectorChange: function(amount) {
		return function(evt) {
			var now = new Date();
				now.setMonth(now.getMonth() + amount);

			this.setState({
				broadMonthDetractor: amount
			});

			var newDate = [
				(now.getMonth()) < 9
					? "0" + (now.getMonth() + 1)
					: (now.getMonth() + 1),
				now.getDate(),
				now.getFullYear()
			].join("/");
			console.log("Date: onBroadMonthSelectorChange -> %s", newDate);

			this.props.onChange(this.props.id, newDate);

		}.bind(this);
	},

	onDateInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		var props = this.props,
			dateDOM;

		if(props.hasOwnProperty('settings')
			&& props.settings.hasOwnProperty('useBroadMonthSelector')
			&& isTrue(props.settings.useBroadMonthSelector)) {

			var monthDetractors = [
				{
					name: "1 month ago",
					amount: -1
				},
				{
					name: "2 months ago",
					amount: -2
				},
				{
					name: "3 months ago",
					amount: -3
				},
				{
					name: "6 months ago",
					amount: -6
				},
				{
					name: "1 year ago",
					amount: -12
				},
			];

			dateDOM = (
				React.createElement("div", {className: "btn-group btn-group-block", "data-toggle": "buttons"}, 
					monthDetractors.map(function(detractor, index) {
						var active = (this.state.broadMonthDetractor === detractor.amount);
						return (
							React.createElement("label", {className: "btn btn-primary-outline" + (active ? " active" : ""), onClick: this.onBroadMonthSelectorChange(detractor.amount)}, 
								React.createElement("input", {type: "radio", 
									name: detractor.name + "-options", 
									autoComplete: "off", 
									defaultChecked: active}), 
								detractor.name
							)
						);
					}.bind(this))
				)
			);

		} else {
			dateDOM = (
				React.createElement("input", {
					type: "date", 
					className: "form-control", 
					autoComplete: "off", 
					maxLength: "255", 

					id: this.props.id, 
					placeholder: this.props.name + " goes here", 
					defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
					onChange: this.onDateInputChange})
			);
		}

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					dateDOM
				)
			)
		);
	}
});

Fields.File = React.createClass({displayName: "File",
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
		if(props.hasOwnProperty("defaultValue") && props.defaultValue !== null && Array.isArray(props.defaultValue)) {
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
				React.createElement("div", {className: "alert alert-" + type}, 
					React.createElement("small", null, state.message)
				)
			);
		}

		// Figure out what to display.
		if(resourcesCount > 0) {
			// We have resources - don't show file input.
			var fileList = resources.map(function(resource, index) {
				var thisType;
				if(storage.hasOwnProperty(resource) && storage[resource].hasOwnProperty("type")) {
					thisType = storage[resource].type;
				}
				return (
					React.createElement("div", {className: "list-group-item", key: ["file-", resource, "-", index].join()}, 
						React.createElement("span", {className: "label label-default m-r"}, resource), 
						React.createElement("small", null, thisType), 
						React.createElement("button", {onMouseUp: this.handleRemoveResource.bind(this, resource), className: "close pull-right"}, 
							"×"
						)
					)
				);
			}.bind(this));

			fileDisplay = (
				React.createElement("div", {className: "card"}, 
					React.createElement("ul", {className: "list-group list-group-flush"}, 
						fileList
					)
				)
			)
		} else {
			// Check if we're currently uploading
			if(!state.isUploading) {
				// No resources found - show file input.
				var uploadButton;

				if(filesCount > 0 || state.isParsing) {
					uploadButton = (
						React.createElement("div", null, 
							React.createElement("button", {type: "button", disabled: state.isParsing, className: "btn btn-sm btn-primary btn-block", onClick: this.handleUploadFiles}, 
								'\u21d1', " ", state.isParsing ? "Preparing files..." : "Upload"
							)
						)
					);
				}

				fileDisplay = (
					React.createElement("div", null, 
						React.createElement("label", {className: "file"}, 
							React.createElement("input", {type: "file", className: "form-control", accept: accept, onChange: this.onFileInputChange}), 
							React.createElement("span", {className: "file-custom"}, 
								filesCount > 0 ? filesCount + " files - " : ""
							)
						), 
						uploadButton
					)
				);
			} else {
				// No resources found - show file input.
				fileDisplay = (
					React.createElement("div", null, 
						React.createElement("h6", {className: "text-muted text-center m-t"}, 
							"Uploading ", filesCount, " ", filesCount === 1 ? "file" : "files", "..."
						), 
						React.createElement("progress", {className: "progress", value: state.uploadProgress, max: 100}, 
							React.createElement("div", {className: "progress"}, 
								React.createElement("span", {className: "progress-bar", style: { width: state.uploadProgress + "%"}}, 
									state.uploadProgress, "%"
								)
							)
						)
					)
				);
			}

		}

		// <h6>{this.state.fileSize > 0 ? getFileSize(this.state.fileSize) : ""}</h6>
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					fileDisplay, 
					statusMessage
				)
			)
		);
	}
});

Fields.Header = React.createClass({displayName: "Header",
	render: function() {
		var description,
			props = this.props;
		if(props.hasOwnProperty('description') && description !== null) {
			description = (
				React.createElement("small", {className: "text-muted"}, props.description)
			);
		}
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement("h3", {className: "forcept-fieldset-header"}, props.name, " ", description), 
				React.createElement("hr", null)
			)
		);
	}
});

Fields.Number = React.createClass({displayName: "Number",
	onNumberInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("input", {
						type: "number", 
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onNumberInputChange})
				)
			)
		);
	}
});

/**
 * fields/Pharmacy.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - settings:
 *   - TODO fix this
 */
 Fields.Pharmacy = React.createClass({displayName: "Pharmacy",

	getInitialState: function() {
		return {
			status: "init",
			justSaved: false,
			setID: null,

			data: {},
			drugs: {},

			selected: {},
		};
	},

	/*
	 *
	 */
	componentWillMount: function() {

		console.group("  | Fields.Pharmacy: mount");
			console.log("Props: %O", this.props);

		// Check if we have a prescription table ID
		if(this.props.hasOwnProperty('defaultValue') && this.props.defaultValue !== null) {
			console.log("Found default value: %s", this.props.defaultValue);
			this.setState({
				setID: this.props.defaultValue
			});
			this.loadPrescriptionSet(this.props.defaultValue);
		}
		this.loadPrescriptionSet();

		console.groupEnd();
	},

	loadPrescriptionSet: function() {
		this.setState({ status: "loading" });
	},

	savePrescriptionSet: function() {
		if(this.state.setID !== null) {
			this.setState({
				status: "saving"
			});
			$.ajax({
				type: "POST",
				url: "/data/prescription-sets/save",
				data: {
					_token: document.querySelector("meta[name='csrf-token']").getAttribute('value'),
					id: this.state.setID,
					prescriptions: this.state.selected
				},
				success: function(resp) {
					console.log(resp);
					if(resp.hasOwnProperty("id")) {

						// Bump the PrescriptionSet ID up to top level
						this.props.onChange(this.props.id, parseInt(resp.id));

						this.setState({
							status: "view",
							justSaved: true
						}, function() {
							// TODO reference this with a state variable?
							setTimeout(function() {
								this.setState({
									justSaved: false,
								});
							}.bind(this), 3000);
						}.bind(this));
					}
				}.bind(this)
			})
		} else {
			console.error("Tried to save prescription set with a null ID");
		}
	},

	createPrescriptionSet: function() {
		this.setState({ status: "loading" });

		$.ajax({
			type: "POST",
			url: "/data/prescription-sets/create",
			data: {
				_token: document.querySelector("meta[name='csrf-token']").getAttribute('value'),
				patientID: this.props.patientID,
				visitID: this.props.visitID
			},
			success: function(resp) {
				console.log(resp);
				var state = {
					status: "view",
					setID: resp.id
				};
				if(resp.hasOwnProperty("prescriptions")) {
					state.selected = resp.prescriptions;
				}
				this.setState(state);
			}.bind(this)
		});
	},

	/*
	 * Grab list of drugs from /data/
	 */
	updateList: function() {
		$.ajax({
			type: "GET",
			url: "/data/pharmacy/drugs",
			success: function(resp) {
				if(resp.status == "success") {
					var drugs = {};
					Object.keys(resp.data).map(function(categoryKey) {
						var thisCategory = resp.data[categoryKey];
						if(thisCategory.hasOwnProperty('settings')&& thisCategory.settings.hasOwnProperty('options')) {
							Object.keys(thisCategory.settings.options).map(function(drugKey) {
								drugs[drugKey] = thisCategory.settings.options[drugKey];
							});
						}
					});
					this.setState({
						data: resp.data,
						drugs: drugs
					});
				}
			}.bind(this),
			error: function() {

			},
			complete: function() {

			}
		});
	},

	/*
	 * When the component mounts, update the pharmacy list
	 */
	componentWillMount: function() {
		this.updateList();
	},

	onSelectedDrugsChange: function(event) {
		console.log("Selected drugs change:");
		var options = event.target.options,
			values = this.state.selected,
			alreadySelected = Object.keys(values);

		console.log("Already selected: %O", values);

		// Loop through all target options
		for(var i = 0; i < options.length; i++) {
			var thisOption = options[i],
				thisValue = thisOption.value;

			// If the option is selected in the <select> input and NOT in our "selected" object
			if(thisOption.selected && alreadySelected.indexOf(thisValue) === -1) {
				values[thisValue] = {
					amount: 1,
					done: false
				};
			} else {
				// Delete an option IF:
				// - it's found in the alreadySelected object
				// - the option is not selected
				// - the option is not marked as done
				if(alreadySelected.indexOf(thisValue) !== -1
					&& !thisOption.selected
					&& !isTrue(values[thisValue].done)) {
					delete values[thisValue];
				}
			}
		}
		this.setState({
			selected: values
		});
	},

	/*
	 *
	 */
	onSignOff: function(drugKey) {
		return function(event) {
			var selected = this.state.selected;
				// signedOff = this.state.signedOff;

			if(selected.hasOwnProperty(drugKey)) {
				console.log("Signing off %s", drugKey);
				selected[drugKey].done = true;
			}

			console.log("Signed off: %O", selected);

			this.setState({
				selected: selected,
			});

		}.bind(this);
	},

	/*
	 *
	 */
	onDrugAmountChange: function(drugKey) {
		return function(event) {
			var selected = this.state.selected;
			if(selected.hasOwnProperty(drugKey)) {
				selected[drugKey].amount = event.target.value;
			}

			this.setState({ selected: selected });
		}.bind(this);
	},

	render: function() {

		var props = this.props,
			state = this.state,
			dataKeys = Object.keys(this.state.data),
			selectedKeys = Object.keys(state.selected),
			renderDOM;

		console.groupCollapsed("  Fields.Pharmacy: render '%s'", props.name);
		console.log("Props: %O", props);
		console.log("State: %O", state);


		switch(state.status) {
			case "init":
				renderDOM = (
					React.createElement("div", {className: "btn btn-block btn-primary", onClick: this.createPrescriptionSet}, 
						'\u002b', " Load prescription set"
					)
				);
				break;
			case "loading":
				renderDOM = (
					React.createElement("img", {src: "/assets/img/loading.gif"})
				);
				break;

			case "saving":
			case "view":

				var drugPicker = (
					React.createElement("div", {className: "alert alert-info"}, 
						React.createElement("strong", null, "One moment..."), React.createElement("div", null, "loading the latest pharmacy data")
					)
				);

				var selectedDrugs,
					saveButton;

				if(dataKeys.length > 0) {
					drugPicker = (
						React.createElement("select", {
							className: "form-control forcept-field-select-drugs", 
							multiple: true, 
							size: 10, 
							onChange: this.onSelectedDrugsChange}, 

							dataKeys.map(function(categoryKey, index) {
								var thisCategory = state.data[categoryKey];

								if(thisCategory.hasOwnProperty('settings')
									&& thisCategory.settings.hasOwnProperty('options')
									&& thisCategory.settings.options !== null) {

									var optionKeys = Object.keys(thisCategory.settings.options);

									return (
										React.createElement("optgroup", {key: thisCategory.name, label: thisCategory.name}, 
											optionKeys.map(function(optionKey, optionIndex) {

												var thisOption = thisCategory.settings.options[optionKey],
													disabled = (thisOption.available === "false"),
													displayName = thisOption.value + (parseInt(thisOption.count) > 0 && thisOption.available ? "\u2014 " + thisOption.count : "")

												if(!disabled) {
													return (
														React.createElement("option", {value: optionKey, key: optionIndex}, 
															displayName
														)
													);
												}

											}.bind(this))
										)
									);
								}
							}.bind(this))
						)
					);


					if(selectedKeys.length > 0) {
						console.log("Selected: %O", state.selected);

						saveButton = (
							React.createElement("div", {className: "col-xs-12"}, 
								React.createElement("div", {className: "btn btn-block btn-lg btn-success m-t", onClick: this.savePrescriptionSet}, 
									state.status === "saving" ? "Working..." : (state.justSaved === true ? "Saved!" : "\u21ea Save prescription set")
								)
							)
						);

						selectedDrugs = selectedKeys.map(function(drugKey) {
							console.log("Selected drug key: %s", drugKey);
							console.log("...this drug's object: %O", state.drugs[drugKey]);

							var thisDrug = state.drugs[drugKey],
								thisSelection = state.selected[drugKey],
								signedOff = isTrue(thisSelection.done),
								preSignOffDOM;

							if(!signedOff) {
								preSignOffDOM = (
									React.createElement("div", {className: "col-xs-12"}, 
										React.createElement("div", {className: "input-group input-group-sm"}, 
											React.createElement("span", {className: "input-group-addon"}, 
												"Amount"
											), 
											React.createElement("input", {
												type: "number", 
												min: "1", 
												className: "form-control form-control-sm", 
												placeholder: "Enter amount here", 
												defaultValue: "1", 
												onChange: this.onDrugAmountChange(drugKey)}), 
											React.createElement("span", {className: "input-group-btn"}, 
												React.createElement("button", {type: "button", className: "btn btn-sm btn-success", onClick: this.onSignOff(drugKey)}, 
													"\u2713", " Done"
												)
											)
										)
									)
								);
							}

							return (
								React.createElement("div", {className: "row m-t"}, 
									React.createElement("div", {className: "col-xs-12"}, 
										React.createElement("h6", null, 
											signedOff ? ["\u2611", thisSelection.amount, "\u00d7"].join(" ") : "\u2610", " ", thisDrug.value
										)
									), 
									preSignOffDOM
								)
							);
						}.bind(this));
					}

				}

				renderDOM = (
					React.createElement("span", null, 
						drugPicker, 
						selectedDrugs, 
						saveButton
					)
				);

				break;
		}

		console.groupEnd();

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					renderDOM
				)
			)
		);

		/*
			{selectDrugs}
			{selectedDrugs}*/

	}
});

Fields.Resource = React.createClass({displayName: "Resource",
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
									React.createElement("img", {src: resource.base64})
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
			React.createElement("div", {className: "forcept-patient-photo-contain " + (props.hasOwnProperty("className") ? props.className : "")}, 
				renderResource
			)
		);
	},
});

/**
 * fields/Select.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - multiple (boolean): 	is this a multiselect input?
 * - onChange (function): 	handle a change to this field's data
 */

Fields.Select = React.createClass({displayName: "Select",

	/*
	 * Get initial state.
	 */
	getInitialState: function() {
		return {
			isCustomDataOptionSelected: false,
			customDataDefaultValue: ""
		};
	},

	/*
	 * Before the field mounts...
	 */
	componentWillMount: function() {
		var props = this.props,
			options,
			optionsKeys,
			optionsValues = [];

		console.groupCollapsed("  Fields.Select: mount '%s'", props.name);
			console.log("Props: %O", props);

		if(props.multiple !== true) {

			if(props.settings.hasOwnProperty('options')) {
				options = props.settings.options;
				optionsKeys = Object.keys(options);
			} else {
				options = {};
				optionsKeys = [];
			}

			console.log("Options keys: %O", optionsKeys);

			// Push all option values to an array.
			optionsKeys.map(function(key) {
				optionsValues.push(options[key].value);
			});

			console.log("Options values: %O", optionsValues);
			console.log("Default value: %s", props.defaultValue);
			console.log("IndexOf value: %i", optionsValues.indexOf(props.defaultValue));

			// Check if our value is NOT a valid option value
			if(typeof props.defaultValue === "string" && optionsValues.indexOf(props.defaultValue) === -1) {
				console.log("Default value exists but isn't a valid value, enabling custom data box");
				this.setState({
					isCustomDataOptionSelected: true,
					customDataDefaultValue: props.defaultValue
				});
			}

		}

		console.groupEnd(); // end: "Fields.Select: mount"
	},

	/*
	 * Handle select input change Event
	 */
	onSelectInputChange: function(event) {

		var props = this.props;

		// Is this a multiselect input?
		if(props.multiple === true) {

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
					// Set top-level state value to nothing (so it says "No data")
					this.setState(this.getInitialState());
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
					this.setState(this.getInitialState());
					props.onChange(props.id, event.target.value);
					break;
			}
		}
	},

	/*
	 * Handle a change to data in the custom data text input
	 */
	onCustomDataInputChange: function(event) {
		this.props.onChange(this.props.id, event.target.value);
	},

	/*
	 * Render the select field.
	 */
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

		console.groupCollapsed("  Fields.Select: render '%s'", props.name);
			console.log("State: %O", state);

		// Check if this field had options within the settings object
		if(props.settings.hasOwnProperty('options')) {
			options = props.settings.options;
			optionsKeys = Object.keys(options);
		} else {
			options = {};
			optionsKeys = [];
		}

		// Default option (prepended to select)
		if(props.multiple === false) {

			defaultOption = (
				React.createElement("option", {value: "__default__", disabled: true}, "Choose an option…")
			);

			// Custom data option (appended to select IF allowCustomData is set)
			if(isTrue(props.settings.allowCustomData)) {
				customDataOption = (
					React.createElement("option", {value: "__custom__"}, "Enter custom data for this field »")
				);
			}

			// Custom data input (show if custom data option select state is true)
			if(isTrue(state.isCustomDataOptionSelected)) {
				customDataInput = (
					React.createElement("input", {type: "text", 
						className: "form-control", 
						placeholder: "Enter custom data here", 
						onChange: this.onCustomDataInputChange, 
						defaultValue: state.customDataDefaultValue})
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
				React.createElement("option", {value: options[optionKey].value, key: this.props.id + "-option-" + index, disabled: disabled}, 
					options[optionKey].value
				)
			);
		}.bind(this));

		// Set size if this is a multiselect input
		var size = props.multiple ? (optionsKeys.length > 30 ? 30 : optionsKeys.length ) : 1,
			defaultValue = state.customDataDefaultValue.length > 0
							? "__default__"
							: (
								props.defaultValue !== null
								? props.defaultValue
								: (
									props.multiple
									? []
									: "__default__"
								)
							);

		console.log("Calculated default value: %s", defaultValue);

		// Build the select input
		displaySelect = (
			React.createElement("select", {
				className: "form-control", 
				onChange: this.onSelectInputChange, 
				defaultValue: defaultValue, 
				multiple: props.multiple, 
				size: size}, 
					defaultOption, 
					optionsDOM, 
					customDataOption
			)
		);

		console.groupEnd(); // End "Fields.Select: render"

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					displaySelect, 
					customDataInput
				)
			)
		);
	}
});

Fields.Text = React.createClass({displayName: "Text",
	onTextInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("input", {
						type: "text", 
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onTextInputChange})
				)
			)
		);
	}
});

Fields.Textarea = React.createClass({displayName: "Textarea",
	onTextareaInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("textarea", {
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onTextareaInputChange})
				)
			)
		);
	}
});

Fields.YesNo = React.createClass({displayName: "YesNo",

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
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("div", {className: "btn-group btn-group-block", "data-toggle": "buttons"}, 
						React.createElement("label", {className: "btn btn-primary-outline" + (state.yes == true ? " active" : ""), onClick: this.onYesNoInputChange(true)}, 
							React.createElement("input", {type: "radio", 
								name: props.name + "-options", 
								autoComplete: "off", 

								defaultChecked: state.yes == true}), 
							"Yes"
						), 
						React.createElement("label", {className: "btn btn-primary-outline" + (state.yes == false ? " active" : ""), onClick: this.onYesNoInputChange(false)}, 
							React.createElement("input", {type: "radio", 
								name: props.name + "-options", 
								autoComplete: "off", 

								defaultChecked: state.yes == false}), 
							"No"
						)
					)
				)
			)
		);
	}
});

/**
 * flowEditor.jsx
 */

/**
 * Heirarchy
 *
 * > FlowEditorFields (houses all field containers and form controls)
 * | Passes down:
 * |   field object, onRemove handler for the configurator, key (time-based input key), index (index in fields object)
 * ==> FlowEditorFieldConfigurator (single field configuration control area)
 *   | Passes down:
 *   |   field type, onChange handler
 *   ==> FlowEditorFieldConfiguratorSettingsDialog
 *
 * Properties:
 *  - stageName: current name of this stage
 *  - stageType: current type of this stage
 *  - fields: currently saved fields
 *  - handleSubmit: handler for submitting fields to server
 */

var FlowEditor = React.createClass({displayName: "FlowEditor",

	/*
	 * Initial container state: has no fields
	 */
	getInitialState: function() {
		return {
			fields: {},
			fieldValidities: {},
			invalidCount: 0,
			isValid: true,
			fieldsRemoved: [],
		};
	},

	/*
	 * Add prop fields to state before mount
	 */
	componentWillMount: function() {
		this.setState({ fields: this.props.fields }, function() {
			this.checkContainerValidity();
		}.bind(this));
	},


	/*
	 * Add a new field to the container
	 */
	handleAddNewField: function() {
		var fields = this.state.fields;
		var fieldValidities = this.state.fieldValidities;
		var key = new Date().getTime();

		fields[key] = FlowEditor.getDefaultFieldState(this.props.stageType); // Default settings for a new input
		fieldValidities[key] = false; // Input defaults to invalid

		this.setState({ fields: fields, fieldValidities: fieldValidities });

		// Since we added a field, we should re-check validity of the container
		this.checkContainerValidity();
	},

	/*
	 * Remove a field from the container (requires key)
	 */
 	handleRemoveField: function(key) {
		var fields = this.state.fields;
		var fieldValidities = this.state.fieldValidities;
		var fieldsRemoved = this.state.fieldsRemoved;

		if(fields.hasOwnProperty(key)) {
			fieldsRemoved.push( (this.refs[key].state.name.length > 0 ? this.refs[key].state.name : '<em>Untitled field</em>' ) + " &nbsp; <span class='label label-default'>" + key + "</span>");
			delete fields[key];
		}
		if(fieldValidities.hasOwnProperty(key)) {
			delete fieldValidities[key];
		}

		this.setState({ fields: fields, fieldValidities: fieldValidities, fieldsRemoved: fieldsRemoved });

		// Since we removed a field, we should re-check validity of the container
		this.checkContainerValidity();
 	},

 	handleConfigUpload: function(event) {
		var reader = new FileReader();
		var file = event.target.files[0];

		reader.onload = function(upload) {
			console.log("Reader onload return upload target result:");
			console.log(upload.target.result);

			var fields = JSON.parse(atob(upload.target.result.split(",")[1]));
			if(fields) {
				this.setState({
					fields: fields,
				});
			}
		}.bind(this);

		reader.readAsDataURL(file);
 	},

 	/*
 	 * Check the validity of a field object
 	 */
 	checkFieldValidity: function(ref) {

 		console.log("Checking field validity for " + ref);

 		var fieldValidities = this.state.fieldValidities;
 			fieldValidities[ref] = this.refs[ref].isValid();

 			console.log(fieldValidities[ref]);

 		this.setState({ fieldValidities: fieldValidities });
 		this.checkContainerValidity();
 	},

 	/*
 	 * Check the validity of the container as a whole
 	 */
 	checkContainerValidity: function() {
 		var valid = true;
 		var invalidCount = 0;

 		for(var fieldKey in this.state.fieldValidities) {
 			if(this.state.fieldValidities[fieldKey] !== true) {
 				invalidCount++;
 				valid = false;
 			}
 		}

 		this.setState({ invalidCount: invalidCount, isValid: valid });
 	},

 	/*
 	 * Compile container data into one coherent object
 	 */
 	compileData: function() {
 		var data = {};
 		Object.keys(this.state.fields).map(function(key, i) {
 			data[key] = this.refs[key].state;
 		}.bind(this));

 		return data;
 	},

 	/*
 	 * Clear removed fields from state
 	 */
 	clearRemoved: function() {
 		this.setState({ fieldsRemoved: [] });
 	},

 	/*
 	 * Render the container
 	 */
	render: function() {
		var fields;

		// Check if any fields are stored in state.
		if(Object.keys(this.state.fields).length > 0) {
			fields = Object.keys(this.state.fields).map(function(key, index) {
				console.log(" => Creating field " + key + " (" + this.state.fields[key].name + ", " + this.state.fields[key].type + ")");
				console.log(this.state.fields[key]);
				return (
					React.createElement(FlowEditor.Field, React.__spread({}, 
						this.state.fields[key], 
						{stageType: this.props.stageType, 
						key: key, 
						"data-key": key, 
						ref: key, 
						index: index, 

						onChange: this.checkFieldValidity.bind(this, key), 
						onRemove: this.handleRemoveField.bind(this, key)}))
				);
			}.bind(this));
		} else {
			fields = (
				React.createElement("div", {className: "alert alert-info"}, 
					"No fields added — try ", React.createElement("a", {className: "alert-link", onClick: this.handleAddNewField}, "adding a new one"), "."
				)
			);
		}

		return (
			React.createElement("div", null, 
				React.createElement("h4", {className: "p-t"}, 
				    "Field configuration", 
				    React.createElement("div", {className: "btn-group btn-group-sm pull-right"}, 
				    	React.createElement("label", {htmlFor: "uploadConfig", className: "btn btn-primary-outline"}, 
				    		'Upload config'
				    	), 
				    	React.createElement("input", {type: "file", id: "uploadConfig", style: {display: "none"}, onChange: this.handleConfigUpload, accept: ".json"}), 
				    	React.createElement("a", {href: '/data/flow/download?stage=' + encodeURIComponent(this.props.stageName) + '&fields=' + window.btoa(JSON.stringify(this.state.fields)), target: "_blank", className: "btn btn-primary-outline"}, 
				    		'Download config'
				    	)
				    )
				), 
				React.createElement("hr", null), 
				React.createElement("div", {id: "flow-editor-fields-contain"}, 
					fields, 
		            React.createElement("button", {type: "button", className: "btn btn-primary btn-lg", onClick: this.handleAddNewField}, "Add a new field"), 
		            React.createElement("button", {type: "button", className: "btn btn-success btn-lg", onClick: this.props.handleSubmit, disabled: !this.state.isValid}, this.state.isValid ? "Submit changes" : this.state.invalidCount + " field(s) need attention before submitting")
				)
			)
		);
	}

});

FlowEditor.customizableFields 	= [ "select", "multiselect", "file", "date" ];
FlowEditor.disableTypeChanges 	= [ "multiselect", "file" ];
FlowEditor.getDefaultFieldState = function(stageType) {
	switch(stageType) {
		case "pharmacy":
			return {
				name: "",
				type: "multiselect",
				mutable: true,
				settings: {
					options: {},
					allowCustomData: false
				},
			}
			break;
		default:
			return {
				name: "",
				type: "text",
				mutable: true,
				settings: {},
			};
			break;
	}
};
FlowEditor.getDefaultOptionState = function(stageType) {
	switch(stageType) {
		case "pharmacy":
			return {
				value: "",
				count: 0,
				available: false
			};
			break;
		default:
			return {
				value: ""
			};
			break;
	}
};


/**
 * Field JSON structure

 {
  "fields": {
    "[id]": {
      "name": "Patient name",
      "type": "text",
    },
    "[id]": {
      "name": "Location",
      "type": "select",
      "settings": {
        "options": ["option 1", "option 2"],
        "allowCustomData": true
      }
    }
  }
}

*/

FlowEditor.Field = React.createClass({displayName: "Field",

	/*
	 * Initial state for a field
	 */
 	getInitialState: function() {
 		return FlowEditor.getDefaultFieldState(this.props.stageType);
 	},

 	/*
 	 * Set up field state based on props prior to mount
 	 */
 	componentWillMount: function() {

        var props = this.props;
 		this.setState({
 			// Required properties
 			name: props.name,
 			type: props.type,
 			mutable: isTrue(props.mutable),

 			// Settings
 			description: props.hasOwnProperty("description") ? props.description : null,
 			settings:
 				(FlowEditor.customizableFields).indexOf(props.type) !== -1 // If this field is a customizable field
                && props.hasOwnProperty('settings')
 				&& typeof props.settings === "object" // If the settings object exists
 				&& Object.keys(props.settings).length > 0  // If the settings object has parameters
 					? props.settings // Use the settings object
 					: null, // Otherwise, return null

 		});
 	},

 	/*
 	 * Handle field name change
 	 */
 	handleFieldNameChange: function(event) {
 		this.setState({ name: event.target.value }, function() {
	 		// Remind container to check validity of inputs
	 		this.props.onChange(this.props['data-key']);
 		});

 	},

 	/*
 	 * Handle field type change
 	 */
 	handleFieldTypeChange: function(event) {
 		console.log("Type change from " + this.state.type + " => " + event.target.value);
 		this.setState({ type: event.target.value }, function() {
	 		// Remind container to check validity of inputs
	 		this.props.onChange(this.props['data-key']);
 		});
 	},

 	/*
 	 *
 	 */
 	handleFieldDescriptionChange: function(event) {
 		this.setState({ description: event.target.value }, function() {
	 		// Remind container to check validity of inputs
	 		this.props.onChange(this.props['data-key']);
 		});
 	},

 	/*
 	 * Handle field removal
 	 */
 	handleRemoveField: function() {
 		this.props.onRemove(this.props.key);
 	},

 	/*
 	 * Handle change to field settings.
 	 */
 	handleFieldSettingsChange: function() {

 		// Grab state object via React ref
 		var settings = this.refs['settings-' + this.props['data-key']].state;

 		// Bump child state up to parent settings state
 		this.setState({ settings: settings });
 	},

 	/*
 	 * Check the validity of this field.
 	 */
 	isValid: function() {
 		var valid = true;

 		// Field must have a name
 		if(this.state.name.length == 0) {
 			valid = false;
 		}

 		console.log(this.state.name + " has length " + this.state.name.length + " and therefore validity " + valid);

 		return valid;
 	},

 	/*
 	 * Display the field
 	 */
 	render: function() {

 		var nameInput,
 			description,
 			typeSelect,
 			disableTypeChangeNotification,
 			fieldContext,
 			fieldContextPlural;

 		// var fieldContext = this.props.stageType == "pharmacy" ? "category" : "input";


 		// Check if type change should be disabled for this input type
 		if(FlowEditor.disableTypeChanges.indexOf(this.state.type) !== -1) {
 			disableTypeChangeNotification = (
 				React.createElement("div", {className: "alert alert-info"}, 
 					"Once created, the ", React.createElement("strong", null, this.state.type), " field type cannot be changed to any other type."
 				)
 			);
 		}

 		// Handle stageType-based changes
 		if(this.props.stageType == "pharmacy") {
 			fieldContext = "Category";
 			fieldContextPlural = "categories";
 		} else {
 			fieldContext = "Input";
 			fieldContextPlural = "inputs";

	 		// Show option to change field type if NOT pharmacy stage
 			typeSelect = (
				React.createElement("div", {className: "form-group"}, 
					React.createElement("label", {className: "form-control-label"}, "Type:"), 
 					React.createElement("select", {className: "form-control", disabled: !this.state.mutable || FlowEditor.disableTypeChanges.indexOf(this.state.type) !== -1, onChange: this.handleFieldTypeChange, defaultValue: this.state.type}, 
 						React.createElement("optgroup", {label: "Inputs"}, 
	 						React.createElement("option", {value: "text"}, "Text input"), 
	 						React.createElement("option", {value: "textarea"}, "Textarea input"), 
	 						React.createElement("option", {value: "number"}, "Number input"), 
	 						React.createElement("option", {value: "date"}, "Date input")
	 					), 
	 					React.createElement("optgroup", {label: "Multiple-option fields"}, 
	 						React.createElement("option", {value: "select"}, "Select input with options"), 
	 						React.createElement("option", {value: "multiselect"}, "Multi-select input with options"), 
	 						React.createElement("option", {value: "file"}, "File input"), 
	 						React.createElement("option", {value: "yesno"}, "Yes or no buttons")
	 					), 
	 					React.createElement("optgroup", {label: "Other"}, 
	 						React.createElement("option", {value: "header"}, "Group fields with a header"), 
	 						React.createElement("option", {value: "pharmacy"}, "Pharmacy - show available medication")
	 					)
 					), 
 					disableTypeChangeNotification
 				)
	 		);
 		}

 		if(this.state.name.length == 0) {
 			nameInputGroup = (
 				React.createElement("div", {className: "form-group has-error"}, 
 					React.createElement("label", {className: "form-control-label", htmlFor: "name-" + this.props['data-key']}, "Name:"), 
 					React.createElement("input", {type: "text", 
 						id: "name-" + this.props['data-key'], 
 						className: "form-control form-control-error", 
 						placeholder: fieldContext + " name", 
 						maxLength: "100", 
 						onChange: this.handleFieldNameChange, 
 						defaultValue: this.state.name}), 
 					React.createElement("div", {className: "alert alert-danger"}, 
 						React.createElement("strong", null, "Heads up:"), " all ", fieldContextPlural, " require a name."
 					)
 				)
 			);
 		} else {
 			nameInputGroup = (
 				React.createElement("div", {className: "form-group"}, 
 					React.createElement("label", {className: "form-control-label", htmlFor: "name-" + this.props['data-key']}, "Name:"), 
 					React.createElement("input", {type: "text", 
 						id: "name-" + this.props['data-key'], 
 						className: "form-control", 
 						placeholder: "Field name", 
 						maxLength: "100", 
 						onChange: this.handleFieldNameChange, 
 						defaultValue: this.state.name})
 				)
 			);
 		}


 		//
 		if(this.state.description !== null
 			&& this.state.description.length > 0) {
 			description = this.props.description;
 		}

 		// {this.state.name.length > 0 ? '"' + this.state.name + '"' : 'this ' + fieldContext.toLowerCase()}
 		return (
 			React.createElement("div", {"data-key": this.props['data-key'], "data-index": this.props.index, className: "row flow-editor-configurator-row p-t"}, 

 				/* Configurator: field setup header */ 
 				React.createElement("div", {className: "col-xs-12"}, 
 					React.createElement("div", {className: "row"}, 
 						React.createElement("div", {className: "col-sm-12 col-md-10"}, 
	 						React.createElement("h4", {className: "field-title"}, 
		 						React.createElement("span", {className: "label label-info"}, "#", this.props.index + 1), 
		 						React.createElement("span", {className: "label label-default"}, this.props['data-key']), 
		 						React.createElement("span", {className: "title hidden-lg-down"}, 
		 							React.createElement("small", null, 
		 							this.state.name.length > 0
		 								? this.state.name
		 								: (this.props.stageType == "pharmacy")
		 									? "Untitled category"
		 									: "Untitled " + this.state.type + " input"
		 							)
		 						)
		 					)
 						), 
	 					React.createElement("div", {className: "col-sm-12 col-md-2"}, 
		 					React.createElement("h4", {className: "field-title m-b"}, 
		 						React.createElement("button", {type: "button", className: "btn btn-sm btn-danger-outline pull-right", disabled: !this.state.mutable, onClick: this.handleRemoveField}, 
		 							"× Remove"
		 						)
		 					)
		 				)
 					)
 				), 

 				/* Configurator: name/type */ 
 				React.createElement("div", {className: "col-sm-4 col-xs-12"}, 
 					nameInputGroup, 
 					typeSelect, 
	 				React.createElement("div", {className: "form-group"}, 
	 					React.createElement("label", {className: "form-control-label"}, "Description:"), 
	 					React.createElement("textarea", {
	 						className: "form-control", 
	 						maxLength: "255", 
	 						placeholder: "Enter a description here", 

	 						onChange: this.handleFieldDescriptionChange, 
	 						defaultValue: description}
	 					)
	 				)
 				), 

 				/* Configurator: settings */ 
	            React.createElement("div", {className: "col-sm-8 col-xs-12"}, 
	                React.createElement(FlowEditor.Field.Settings, {
	                	stageType: this.props.stageType, 
	                	ref: 'settings-' + this.props['data-key'], 
	                	"field-key": this.props['data-key'], 
	                	type: this.state.type, 
	                	mutable: this.state.mutable, 
	                	settings: this.state.settings, 

	                	onChange: this.handleFieldSettingsChange}
	                	)
	            )
	        )
 		);
 	}

 });

/*
 * Properties:
 *  - stageType:
 *  - ref
 *  - field-key
 *  - type: type of the input for which we are showing options
 *  - mutable: is the field mutable
 *  - settings: previously defined settings stage
 *
 *  - onChange: define handler for when options change
 */
FlowEditor.Field.Settings = React.createClass({displayName: "Settings",

	/*
	 * Return initial state based on property type
	 */
	getInitialState: function() {

		console.group("FlowEditor.Field.Settings: getInitialState");
		console.log("Type: %s", this.props.type);

		var initialState = {};
		// Return initial state if settings are necessary for this file type
		switch(this.props.type) {

			// Date input
			case "date":
				console.log("Dialog is for date field, returning initial date options.");
				initialState = {
					useBroadMonthSelector: false
				};
				break;


			// Select input
			case "select":
				console.log("Dialog is for select field, returning initial select options.");
				initialState = {
					options: {},
					allowCustomData: false,
				};
				break;

			// Multiselect input
			case "multiselect":
				console.log("Dialog is for multiselect field, returning initial select options.");
				initialState = {
					options: {},
				};
				break;

			// File input
			case "file":
				initialState = {
					accept: []
				};
				break;

			// For all others...
			default:
				console.log("Field does not need settings, skipping.");
				break;
		}


		console.groupEnd();

		return initialState;
	},

	/*
	 * Prepare component for mounting
	 */
	componentWillMount: function() {

		console.group("FlowEditor.Field.Settings: componentWillMount");
		console.log("Props: %O", this.props);
		console.log("Type: %s", this.props.type);

		// If we have a field type that requires settings, load default settings into state
		switch(this.props.type) {

			// Select field type
			case "date":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {
					console.log("DATE FIELD: props.settings found");
					// If there's a set value for allowing custom data...
					if(this.props.settings.hasOwnProperty("useBroadMonthSelector") && this.props.settings.useBroadMonthSelector == "true") {
						console.log("DATE FIELD: use broad month selector == true");
						this.setState({ useBroadMonthSelector: (this.props.settings.useBroadMonthSelector == "true") });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;

			// Select field type
			case "select":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {

					// Settings array exists. Check for each setting data point
					if(this.props.settings.hasOwnProperty("options")) {
						this.setState({ options: this.props.settings.options });
					}

					// If there's a set value for allowing custom data...
					if(this.props.settings.hasOwnProperty("allowCustomData") && this.props.settings.allowCustomData == "true") {
						this.setState({ allowCustomData: (this.props.settings.allowCustomData == "true") });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;

			// Multiselect field type
			case "multiselect":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {

					// Settings array exists. Check for each setting data point
					if(this.props.settings.hasOwnProperty("options")) {
						this.setState({ options: this.props.settings.options });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;

			// File field type
			case "file":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {

					// Settings array exists. Check for each setting data point
					if(this.props.settings.hasOwnProperty("accept")) {
						this.setState({ accept: this.props.settings.accept });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;
		}

		console.groupEnd();
	},

	/*
	 * Component completed mounting (debug)
	 */
	componentDidMount: function() {
		console.log("Component 'FlowEditorFieldConfiguratorSettingsDialog' mounted, state is now:");
		console.log(this.state);
 		console.log("--[/mount: " + this.props['field-key'] + "]--");
 		console.log("");
	},

	/*
	 * Handle adding of a new option (SELECT/MULTISELECT type)
	 */
	handleAddOption: function() {

		console.log("");
		console.log("--[add option: " + this.props['field-key'] + "]--");

		var push = function() {

			// Grab options object, add a new entry with default option state based on stage type
			var options = this.state.options;
				options[new Date().getTime()] = FlowEditor.getDefaultOptionState(this.props.stageType);

			// Push to our local state
			this.setState({ options: options });

			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);

			console.log("--[/add option: " + this.props['field-key'] + "]--");
			console.log("");

		}.bind(this);

		if(!this.state.hasOwnProperty('options')) {
			// No options yet (type was probably just changed to select), add one.
			// Make sure to set other initial state values first
			console.log("\t| Missing options property, returning component to initial state and continuing...");
			this.setState(this.getInitialState(), function() {
				push();
			}.bind(this));
		} else {
			console.log("\t| Options array exists, pushing...");
			push();
		}

	},

	/*
	 * Handle removing of an option (SELECT/MULTISELECT type)
	 */
	handleRemoveOption: function(optionKey) {
		// Cache options object
		var options = this.state.options;

		// Get rid of it!
		if(options.hasOwnProperty(optionKey)) {
			delete options[optionKey];
		}

		this.setState({ options: options }, function() {

			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);

		}.bind(this));
	},

	/*
	 * Handle change option position (SELECT/MULTISELECT type)
	 */
	handleChangeOptionPosition: function(where, optionKey) {
		return function(event) {

			console.log("Looking to move '" + optionKey + "' " + where);

			var options = this.state.options;
			var keys = Object.keys(options);
			var value = options[optionKey]; 		// Get option data object at optionKey
			var index = keys.indexOf(optionKey);	// Get index of optionKey

			// If the index was found
			if(index !== -1) {

				console.log(" -> found @ index " + index);

				var cacheKey;
				var indexKey = keys[index];

				switch(where) {
					case "up":
						cacheKey = keys[index - 1]; // get option KEY corresponding to the index above
						break;
					case "down":
						cacheKey = keys[index + 1]; // get option KEY corresponding to the index below
						break;
				}

				// Get option value object by index
				var cacheValue = options[cacheKey];
					options[cacheKey] = value;
					options[indexKey] = cacheValue;

				console.log(" -> caching key: " + cacheKey);
				console.log(" -> value @ cached key: " + cacheValue);
				console.log(" -> New options:");
				console.log(options);

				this.setState({
					options: options
				}, function() {
					// Bump state up to parent for aggregation
					this.props.onChange(this.state);
				}.bind(this));

			} else {
				console.log("WARNING: " + where + " not found in options");
			}
		}.bind(this);
	},

	/*
	 * Handle change of option text (SELECT/MULTISELECT type)
	 */
	handleChangeOptionText: function(optionKey) {
		return function(event) {
			var options = this.state.options;

			// If the option at this index exists
			if(options.hasOwnProperty(optionKey)) {
				options[optionKey].value = event.target.value;
			}

			this.setState({ options: options }, function() {
				// Bump changes to parent element for aggregation
				this.props.onChange(this.state);
			}.bind(this));


		}.bind(this);
	},

	/*
	 * Handle change of allow custom data checkbox (SELECT/MULTISELECT type)
	 */
	handleAllowCustomDataChange: function() {

		var newStatus = !this.state.allowCustomData;
		this.setState({ allowCustomData: newStatus }, function() {
			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);
		});

	},

	/*
	 * Handle change of allow custom data checkbox (SELECT/MULTISELECT type)
	 */
	handleBroadMonthSelectorChange: function() {
		console.log("handleBroadMonthSelectorChange");
		var newStatus = !this.state.useBroadMonthSelector;
		this.setState({ useBroadMonthSelector: newStatus }, function() {
			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);
		});
	},

	/**
	 * Change the allowed filetypes (FILE field type)
	 */
	handleChangeAllowedFiletypes: function(event) {

		var options = event.target.options;
		var values = [];

		for(var i = 0; i < options.length; i++) {
			if(options[i].selected) {
				values.push(options[i].value);
			}
		}

		console.log("Allowed filetypes is now:");
		console.log(values);
		console.log(this.state);

		this.setState({ accept: values }, function() {
			this.props.onChange(this.state);
		}.bind(this));
	},

	/*
	 *
	 */
	handleDrugQuantityChange: function(optionKey) {
		return function(event) {
			var options = this.state.options;
				options[optionKey].count = parseInt(event.target.value);

			this.setState({
				options: options
			}, function() {
				this.props.onChange(this.state);
			}.bind(this));
		}.bind(this);
	},

	/*
	 *
	 */
	handleDrugAvailabilityChange: function(optionKey) {
		return function(event) {
			var options = this.state.options;
				options[optionKey].available = (event.target.value == "true");

			this.setState({
				options: options
			}, function() {
				this.props.onChange(this.state);
			}.bind(this));

		}.bind(this);
	},

	/*
	 * Render the settings dialog
	 */
	render: function() {

		console.log("Rendering settings dialog for type " + this.props.type);

		var mutabilityMessage;

		// Add a message if this field is immutable
		if(this.props.mutable == false) {
			mutabilityMessage = (
				React.createElement("div", {className: "alert alert-danger"}, 
					React.createElement("strong", null, "Notice:"), " This field is protected. Only the display name and type-based settings can be modified."
				)
			);
		} else {
			mutabilityMessage = (
				React.createElement("span", null)
			);
		}

		switch(this.props.type) {
			case "text":
			case "textarea":
			case "number":
			case "yesno":
			case "header":
			case "pharmacy":
				return (
					React.createElement("div", null, 
						React.createElement("div", {className: "alert alert-info m-t"}, 
							"No configuration is required for ", this.props.type, " inputs."
						), 
						mutabilityMessage
					)
				);
				break;

			case "date":
				return (
					React.createElement("div", {className: "form-group row"}, 
						React.createElement("div", {className: "col-sm-12"}, 
							React.createElement("h2", null, "Settings"), 
							React.createElement("div", {className: "checkbox m-t"}, 
								React.createElement("label", null, 
									React.createElement("input", {type: "checkbox", 
										checked: this.state.useBroadMonthSelector == true, 
										onChange: this.handleBroadMonthSelectorChange}), 
										"Use broad month selector instead of specific date selector"
								)
							), 
							mutabilityMessage
						)
					)
				);
				break;
			case "select":
			case "multiselect":

				console.log(" -> Options:");
				console.log(this.state.options);

				var optionInputs,
					customDataCheckbox;

				var noOptionsDefined = function() {

					// No options available, show info message
					optionInputs = (
						React.createElement("div", {className: "alert alert-info"}, 
							"No options have been defined — try ", React.createElement("a", {className: "alert-link", onClick: this.handleAddOption}, "adding one"), "."
						)
					);

				};

				if(this.state.hasOwnProperty('allowCustomData') && this.state.allowCustomData == true) {
					customDataCheckbox = (
						React.createElement("div", {className: "col-sm-12"}, 
							React.createElement("div", {className: "checkbox m-t"}, 
								React.createElement("label", null, 
									React.createElement("input", {type: "checkbox", 
										checked: this.state.allowCustomData == true, 
										onChange: this.handleAllowCustomDataChange}), 
										"Allow users to enter custom data for this field"
								)
							)
						)
					);
				}

				// If there are options in the state
				if(this.state.hasOwnProperty('options')) {
					var optionKeys = Object.keys(this.state.options);

					if(optionKeys.length > 0) {

						// Map option input containers to one variable
						optionInputs = optionKeys.map(function(optionKey, index) {
							// console.log(" : " + index + "=" + value);

							var thisOption = this.state.options[optionKey];
							var upButton,
								downButton,
								drugOptions;

							if(index !== 0) {
								upButton = (
									React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.handleChangeOptionPosition("up", optionKey)}, 
										"↑"
									)
								);
							}

							if(index !== (optionKeys.length - 1)) {
								downButton = (
									React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.handleChangeOptionPosition("down", optionKey)}, 
										"↓"
									)
								);
							}

							var pharmacyAvailableIcon;
							if(this.props.stageType == "pharmacy") {
								if(isTrue(thisOption.available)) {
									pharmacyAvailableIcon = (
										React.createElement("span", {className: "label label-success col-sm-1"}, 
											"Check"
										)
									);
								} else {
									pharmacyAvailableIcon = (
										React.createElement("span", {className: "label label-default col-sm-1"}, 
											"x"
										)
									);
								}
								drugOptions = (
									React.createElement("div", {className: "col-xs-11 col-sm-offset-1"}, 
										React.createElement("div", {className: "row"}, 
											React.createElement("div", {className: "col-xs-12 col-sm-6"}, 
												React.createElement("div", {className: "input-group input-group-sm"}, 
													React.createElement("input", {
														type: "number", 
														className: "form-control", 
														min: 0, 
														value: thisOption.count, 
														onChange: this.handleDrugQuantityChange(optionKey)}), 
													React.createElement("span", {className: "input-group-addon"}, 
														"qty in stock"
													)
												)
											), 
											React.createElement("div", {className: "col-xs-12 col-sm-6"}, 
												React.createElement("div", {className: "input-group input-group-sm"}, 
													React.createElement("span", {className: "input-group-addon"}, 
														"available"
													), 
													React.createElement("select", {
														className: "form-control", 
														defaultValue: thisOption.available, 
														onChange: this.handleDrugAvailabilityChange(optionKey)}, 
														React.createElement("option", {value: true}, "Yes"), 
														React.createElement("option", {value: false}, "No")
													)
												)
											)
										)
									)
								);

							}



							return (
								React.createElement("div", {className: (this.props.stageType !== "pharmacy" ? "field-select-option " : "") + "form-group row", key: index}, 
									pharmacyAvailableIcon, 
									React.createElement("div", {className: this.props.stageType !== "pharmacy" ? "col-sm-12" : "col-sm-11"}, 
										React.createElement("div", {className: "input-group input-group-sm"}, 
											React.createElement("input", {type: "text", 
												placeholder: "Enter a value for this option", 
												className: "form-control", 
												value: thisOption.value, 
												onChange: this.handleChangeOptionText(optionKey)}), 
											React.createElement("span", {className: "input-group-btn"}, 
												upButton, 
												downButton, 
												React.createElement("button", {type: "button", className: "btn btn-danger", onClick: this.handleRemoveOption.bind(this, optionKey)}, 
												  	React.createElement("span", null, "×")
												)
											)
										)
									), 
									drugOptions
								)
							);
						}.bind(this));

					} else {
						noOptionsDefined();
					}
				} else {
					noOptionsDefined();
				}

				return (
					React.createElement("div", {className: "field-select-options-contain p-t"}, 
		            	React.createElement("h5", null, this.props.stageType == "pharmacy" ? "Drugs in this category" : "Options", " (",  this.state.hasOwnProperty('options') ? Object.keys(this.state.options).length : 0, ")"), 
						optionInputs, 
						customDataCheckbox, 
						mutabilityMessage, 
						React.createElement("button", {type: "button", className: "btn btn-primary-outline", onClick: this.handleAddOption}, 
							"Add another ", this.props.stageType == "pharmacy" ? "drug" : "option"
						)
					)
				);

				break;

			case "file":
				return (
					React.createElement("div", {className: "field-select-options-contain"}, 
						React.createElement("h5", null, "Accepted file types"), 
						React.createElement("select", {className: "form-control", multiple: true, onChange: this.handleChangeAllowedFiletypes, defaultValue: this.state.accept}, 
							React.createElement("option", {value: "image/*"}, "image / *")
						), 
						mutabilityMessage
					)
				);
				break;

			default:
				return (
					React.createElement("div", null, 
						React.createElement("div", {className: "alert alert-danger m-t"}, 
							"Unrecognized input type \"", this.props.type, "\""
						), 
						mutabilityMessage
					)
				);
				break;
		}
	}
});

/**
 * patients.jsx
 */

var PatientsTable = React.createClass({displayName: "PatientsTable",

    getInitialState: function() {
        return {
            patients: {},

            name: "",
            forceptID: "",
            fieldNumber: ""
        };
    },

    componentWillMount: function() {
        this.getPatients();
    },

    getPatients: function(endpt, method, constraints) {
        endpt = endpt || "fetch";
        var type = (endpt === "fetch" ? "GET" : "POST");
        method = method || "";
        constraints = constraints || {};

        constraints._token = document.querySelector("meta[name='csrf-token']").getAttribute('value');

        $.ajax({
            type: type,
            url: "/patients/" + endpt + "/" + method,
            data: constraints,
            success: function(resp) {

                var patients = resp.patients;
                var patientKeys = Object.keys(patients);

                for(var i = 0; i < patientKeys.length; i++) {
                    patients[patientKeys[i]] = Utilities.applyGeneratedFields(patients[patientKeys[i]]);
                }

                this.setState({
                    patients: patients
                });
            }.bind(this)
        });
    },

    handleSearchNameChange: function(event) {
        var value = event.target.value;
        if(value.length == 0) {
            this.getPatients();
        }

        this.setState({
            name: value
        });
    },

    handleSearchForceptIDChange: function(event) {
        var value = event.target.value;
        if(value.length == 0) {
            this.getPatients();
        }

        this.setState({
            forceptID: value
        });
    },

    handleDoSearch: function(type) {
        console.log("handleDoSearch");
        this.getPatients("search", "", {
            by: type,
            for: this.state[type]
        });
    },

    render: function() {
        var patientRows;

        var patients = this.state.patients,
            patientIDs = Object.keys(patients),
            patientsCount = patientIDs.length;

        if(patientsCount > 0) {
            patientRows = patientIDs.map(function(patientID, index) {
                var thisPatient = patients[patientID];

                var photo;
                if(thisPatient.hasOwnProperty('photo') && thisPatient.photo !== null) {
                    var resourceObj = [];
                    try {
                        resourceObj = JSON.parse(thisPatient.photo);
                    } catch(e) {
                        console.log("could not parse patient photo");
                    }
                    if(resourceObj.length > 0) {
                        photo = (
                            React.createElement(Fields.Resource, {
                                id: resourceObj[0], 
                                resource: { type: "image/jpeg"}, 
                                className: "thumbnail"})
                        );
                    }
                } else {
                    photo = "No photo";
                }

                var visitLabel = (
                    React.createElement("em", null, "Checked out")
                ),
                    visitsCount = thisPatient.visits.length;

                if(visitsCount > 0) {
                    if(thisPatient.hasOwnProperty("visit") && thisPatient.visit !== null) {
                        visitLabel = (
                            React.createElement("a", {href: ["/visits/stage/", thisPatient.visit.stage, "/handle/", thisPatient.visit.id].join("")}, 
                                React.createElement("h4", null, 
                                    React.createElement("span", {className: "label label-success"}, 
                                        thisPatient.visit.id, " »"
                                    )
                                )
                            )
                        );
                    }
                }

                return (
                    React.createElement("tr", null, 
                        React.createElement("td", {width: 200}, 
                            photo
                        ), 
                        React.createElement("td", null, 
                            React.createElement("h4", null, 
                                React.createElement("span", {className: "label label-default"}, thisPatient.id)
                            )
                        ), 
                        React.createElement("td", null, 
                            Utilities.getFullName(thisPatient)
                        ), 
                        React.createElement("td", null, 
                            thisPatient.visits.length
                        ), 
                        React.createElement("td", null, 
                            visitLabel
                        ), 
                        React.createElement("td", null, 
                            thisPatient.created_at
                        ), 
                        React.createElement("td", null, 
                            thisPatient.updated_at
                        ), 
                        React.createElement("td", null, 
                            React.createElement("a", {href: ["/patients/view/", thisPatient.id].join("")}, 
                                "»"
                            )
                        )
                    )
                );
            }.bind(this));
        }

        return (
            React.createElement("div", {className: "p-t"}, 
                React.createElement("h1", null, "Patients (", patientsCount, ")"), 
                React.createElement("fieldset", {className: "fieldset"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "col-xs-12 col-sm-4"}, 
                            React.createElement("div", {className: "input-group"}, 
                                React.createElement("input", {type: "text", className: "form-control", placeholder: "Search by first or last name...", onChange: this.handleSearchNameChange}), 
                                React.createElement("span", {className: "input-group-btn"}, 
                                    React.createElement("button", {className: "btn btn-primary", type: "button", onMouseUp: this.handleDoSearch.bind(this, "name")}, 
                                        "Search"
                                    )
                                )
                            )
                        ), 
                        React.createElement("div", {className: "col-xs-12 col-sm-4"}, 
                            React.createElement("div", {className: "input-group"}, 
                                React.createElement("input", {type: "number", className: "form-control", placeholder: "Search by Forcept ID...", min: "100000", onChange: this.handleSearchForceptIDChange}), 
                                React.createElement("span", {className: "input-group-btn"}, 
                                    React.createElement("button", {className: "btn btn-primary", type: "button", onMouseUp: this.handleDoSearch.bind(this, "forceptID")}, 
                                        "Search"
                                    )
                                )
                            )
                        ), 
                        React.createElement("div", {className: "col-xs-12 col-sm-4"}, 
                            React.createElement("div", {className: "input-group"}, 
                                React.createElement("input", {type: "number", className: "form-control", placeholder: "Search by field number..."}), 
                                React.createElement("span", {className: "input-group-btn"}, 
                                    React.createElement("button", {className: "btn btn-primary", type: "button"}, 
                                        "Search"
                                    )
                                )
                            )
                        )
                    )
                ), 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-xs-12 table-responsive"}, 
                        React.createElement("table", {className: "table table-striped"}, 
                            React.createElement("thead", null, 
                                React.createElement("tr", null, 
                                    React.createElement("th", null, 
                                        "Photo"
                                    ), 
                                    React.createElement("th", null, 
                                        "ID"
                                    ), 
                                    React.createElement("th", null, 
                                        "Name"
                                    ), 
                                    React.createElement("th", null, 
                                        "Visits"
                                    ), 
                                    React.createElement("th", null, 
                                        "Location"
                                    ), 
                                    React.createElement("th", null, 
                                        "Created at"
                                    ), 
                                    React.createElement("th", null, 
                                        "Last updated"
                                    ), 
                                    React.createElement("th", null

                                    )
                                )
                            ), 
                            React.createElement("tbody", null, 
                                patientRows
                            )
                        )
                    )
                )
            )
        );
    }
});

/**
 * stageVisits.jsx
 */


var StageVisits = React.createClass({displayName: "StageVisits",

	getInitialState: function() {
		return {
			isFetching: true,
			visits: {}
		};
	},

	componentWillMount: function() {
		this.fetchVisits();
		setInterval(function() {
			this.fetchVisits();
		}.bind(this), 5000);
	},

	fetchVisits: function() {
		$.ajax({
			type: "GET",
			url: "/visits/fetch/" + this.props.stage.id,
			success: function(resp) {
				if(resp.hasOwnProperty('visits')) {
					console.log("[StageVisits]->fetchVisits()");
					this.setState({ visits: resp.visits }, function() {
						__debug(this.state);
					}.bind(this));
				} else {
					console.log("[StageVisits]->fetchVisits(): empty response");
					this.setState({ visits: {} });
				}
			}.bind(this),
			complete: function(resp) {
				this.setState({ isFetching: false });
			}.bind(this)
		});
	},

	render: function() {

		var visitsDOM,
			fetching,
			visitKeys = Object.keys(this.state.visits);

		// If there are visits present...
		if(visitKeys.length > 0) {

			// Show visits
			visitsDOM = visitKeys.map(function(visitID, index) {

				// Cache this visit's data.
				var visit = this.state.visits[visitID];

				// Map patients for this visit
				var patients = visit.patients.map(function(patientID, patientIndex) {

					// If the patient has a patient_models object
					if(visit.patient_models.hasOwnProperty(patientID.toString())) {

						var patient = visit.patient_models[patientID.toString()],
							patientPhoto,
							// priorityNotification,
							priorityClass = "label-primary",
							priority = "Normal",
							noPhoto = function() {
								console.log("[StageVisits] patient #" + patientID + " does NOT have valid photo");
								patientPhoto = (
									React.createElement("small", null, React.createElement("em", null, "No photo"))
								);
							};

						if(patient.hasOwnProperty('photo') && patient.photo !== null) {
							console.log("[StageVisits] patient #" + patientID + " has photo attribute");

							var resources = [];
							try {
								resources = JSON.parse(patient.photo);
							} catch(e) {
								console.log("[StageVisits] error parsing photo of patient #" + patientID);
								console.log(e);
								resources = [];
							}

							if(Array.isArray(resources) && resources.length > 0) {
								patientPhoto = (
									React.createElement(Fields.Resource, {
										id: resources[0], 
										resource: { type: "image/jpeg"}, 
										className: "thumbnail"})
								);
							} else {
								noPhoto();
							}
						} else {
							noPhoto();
						}

						if(patient.hasOwnProperty('priority') && patient.priority !== null) {
							switch(patient.priority.toLowerCase()) {
								case "high":
									// priorityNotification = (
									// 	<div className="card-block bg-warning">
									// 		<small>Priority: <strong>high</strong></small>
									// 	</div>
									// );
									priority = "High";
									priorityClass = "label-warning";
									break;
								case "urgent":
									// priorityNotification = (
									// 	<div className="card-block bg-danger">
									// 		<small>Priority: <strong>urgent</strong>!</small>
									// 	</div>
									// );
									priority = "Urgent";
									priorityClass = "label-danger";
									break;
							}
						}

						var patientFullName = patient.hasOwnProperty("full_name") ? patient.full_name : null,
							patientBirthday = patient.hasOwnProperty("birthday") ? patient.birthday : null,
							patientCreatedAt = patient.hasOwnProperty("created_at") ? patient.created_at : null;

						var getName = (patientFullName !== null && patientFullName.length > 0) ? patientFullName : "Unnamed patient",
							getAge = (patientBirthday !== null && patientBirthday.length > 0) ? Utilities.calculateAge(patientBirthday) : "Unknown",
							getCreatedAt = (patientCreatedAt !== null && patientCreatedAt.length > 0) ? patientCreatedAt : "Unknown";

						return (
							React.createElement("div", {className: "col-xs-12 col-sm-6", key: "patient-row-" + patientID}, 
								React.createElement("div", {className: "card"}, 
									React.createElement("div", {className: "card-block"}, 
										React.createElement("div", {className: "row"}, 
											React.createElement("div", {className: "col-xs-12 col-sm-4"}, 
												patientPhoto
											), 
											React.createElement("div", {className: "col-xs-12 col-sm-8 p-t text-xs-center text-sm-left"}, 
												React.createElement("div", null, 
													React.createElement("span", {className: "label label-primary"}, "#", patientIndex + 1), 
													React.createElement("span", {className: "label label-default"}, patientID)
												), 
												React.createElement("h4", {className: "forcept-stagevisits-patient-name"}, 
													getName
												)
											)
										)
									), 
									React.createElement("ul", {className: "list-group list-group-flush"}, 
									    React.createElement("li", {className: "list-group-item"}, 
											React.createElement("span", {className: "label label-pill pull-right " + priorityClass}, priority), 
											"Priority"
										), 
									    React.createElement("li", {className: "list-group-item"}, 
											React.createElement("span", {className: "label label-primary label-pill pull-right"}, getAge), 
											"Age"
										), 
									    React.createElement("li", {className: "list-group-item"}, 
											React.createElement("span", {className: "label label-primary label-pill pull-right"}, getCreatedAt), 
											"Created"
										)
									)
								)
							)
						);

					} else {
						// Apparently we're missing this patients data
						return (
							React.createElement("div", {className: "col-sm-12 col-md-4", key: "patient-col-" + patientID}, 
								React.createElement("div", {className: "card"}, 
									React.createElement("div", {className: "alert alert-danger"}, 
										React.createElement("strong", null, "Uh oh:"), " an error occurred.", React.createElement("br", null), 
										React.createElement("em", null, "Missing data for patient ", patientID)
									)
								)
							)
						);
					}

				}.bind(visit));

				// Return the visit block
				return (
					React.createElement("blockquote", {className: "blockquote", key: "visit-" + index}, 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-12 col-sm-8"}, 
								React.createElement("h2", null, 
									React.createElement("label", {className: "label label-default", "data-toggle": "tooltip", "data-placement": "top", title: "Visit ID"}, visit.id), 
									"  ", visit.patients.length, " patient", visit.patients.length == 1 ? "" : "s"
								)
							), 
							React.createElement("div", {className: "col-xs-12 col-sm-4"}, 
								React.createElement("a", {href: "/visits/stage/" + this.props.stage.id + "/handle/" + visit.id, className: "btn btn-primary btn-block btn-lg"}, "Handle visit #", visit.id, " »")
							)
						), 
						React.createElement("div", {className: "row m-t"}, 
							patients
						), 
						React.createElement("hr", {className: "m-b-0"})
					)
				);
				//
				// <div className="row p-t">
				// 	{patients}
				// </div>

			}.bind(this));

		} else {
			// Otherwise, no visits are present.
			visitsDOM = (
				React.createElement("div", {className: "alert alert-info"}, 
					"There are currently no visits in this stage."
				)
			);
		}

		if(this.state.isFetching) {
			fetching = (
				React.createElement("img", {src: "/assets/img/loading.gif"})
			);
		}

		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "col-xs-12"}, 
					React.createElement("h1", {className: "p-l text-xs-center"}, this.props.stage.name, ": ", this.state.visits.length, " active visit", this.state.visits.length == 1 ? "" : "s"), 
					React.createElement("hr", null), 
					visitsDOM, 
					fetching
				)
			)
		);
	}

});

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

/**
 * visit.jsx
 */

/*
 * Visit container
 *
 * The visit container acts as a state bridge between the
 * PatientsOverview and PatientsContainer module.
 *
 * Accepted properties:
 *  - _token: Laravel CSRF token
 *  - containerTitle: Title for the PatientContainer block
 *  - controlsType: Denote which set of controls should appear ["new-visit", "stage-visit"]
 *  - redirectOnFinish: URL to redirect to on complete
 *
 *  - visitID: ID of the current visit being modified (null if new visit setup)
 *  - patients: Patients object with fieldID => data setup
 *  - stages: Array of stages (in order of 'order') for finish modal
 *  - currentStage: ID of current stage
 *  - currentStageType: type of current stage (basic, pharmacy)
 *
 *  - mutableFields: NEW Fields which should be mutable for EACH patient in the PatientContainer block.
 *  - patientFields: PREEXISTING Fields which should have their data displayed in the PatientOverview block.
 *  - summaryFields: PREEXISTING Fields which should have their data displayed in the PatientOverview block.
 */
var Visit = React.createClass({displayName: "Visit",

	/*
	 * Get initial Visit state
	 */
	getInitialState: function() {
		return {
			isSubmitting: false,
			progress: 0,
			confirmFinishVisitResponse: null,

			patients: {},
			resources: {},
			prescriptions: {},
		};
	},

	/*
	 * Deploy necessary state changes prior to mount
	 */
	componentWillMount: function() {

		var props = this.props;

		console.group("Visit: mount");
			console.log("Visit properties: %O", props);

		if(props.hasOwnProperty("patients") && props.patients !== null) {
			console.log("Pre-existing patients detected, loading into state.");

			var patients = {};
			for(var patientID in props.patients) {
				console.log("Setting up patient %i", patientID);
				patients[patientID] = Utilities.applyGeneratedFields(props.patients[patientID]);
			}

			console.log("Done setting up patients: %O", patients);

			this.setState({
				patients: patients
			}, function() {
				console.log("Done mounting %i patients.", Object.keys(patients).length);
				__debug(this.state.patients);
			}.bind(this));
		}

		console.groupEnd();
	},

	/*
	 *
	 */
	handleConfirmFinishVisit: function( destination, modalObject ) {

		var props = this.props;

		// Update state to submitting
		this.setState({
			isSubmitting: true,
		});

		// Go ahead and close the modal
		$("#visit-finish-modal")
			.modal('hide')
			.on('hidden.bs.modal', function(e) {
				console.log("Modal hidden");
				modalObject.setState(modalObject.getInitialState());
				modalObject.resetSelectState();
			});

		$.ajax({
			type: "POST",
			url: "/visits/store",
			data: {
				"_token": props._token,
				visit: props.visitID,
				patients: this.state.patients,
				stage: props.currentStage,
				destination: destination
			},
			xhr: function() {
				var xhr = new window.XMLHttpRequest();

				xhr.upload.addEventListener("progress", function(evt) {
		            if (evt.lengthComputable) {
		                var percentComplete = evt.loaded / evt.total;

		                //Do something with upload progress here
		                this.setState({
		                	progress: percentComplete * 100
		                });
		            }
		       }.bind(this), false);

				return xhr;
			}.bind(this),
			success: function(resp) {
				this.setState(this.getInitialState());
			}.bind(this),
			error: function(resp) {

			},
			complete: function(resp) {
				this.setState({
					confirmFinishVisitResponse: resp.responseJSON
				});
			}.bind(this)
		});
	},

	/*
	 * Handle addition of a new patient.
	 *
	 * @arguments
	 * - patient: Object of patient data as pulled from the patients database table
	 */
	handlePatientAdd: function( patient ) {
		var patients = this.state.patients;

		if(patients.hasOwnProperty(patient.id)) {
			// Patient already in Visit
		} else {
			// Update state with new patient
			patients[patient.id] = Utilities.applyGeneratedFields(patient);
			this.setState({
				confirmFinishVisitResponse: null,
				patients: patients
			});
		}
	},

	/*
	 * Aggregate data
	 */
	handleFinishVisit: function( isDoneLoading ) {
		$("#visit-finish-modal")
			.modal('show');
	},


	/*
	 *
	 */
	topLevelPatientStateChange: function(patientID, fieldID, value) {
		console.log("[Visit]->topLevelPatientStateChange(): patientID=" + patientID + ", fieldID=" + fieldID + ", value=" + value);

		// Check if patient is in our patients array
		if(this.state.patients.hasOwnProperty(patientID)) {

			var patients = this.state.patients; // Grab patients from state
				patient = patients[patientID], // Grab patient object
				patient[fieldID] = value; // Find our patient and set fieldID = passed value

			// Apply generated fields to patient object
			patient = Utilities.applyGeneratedFields(patient);

			// Push patients back to state
			this.setState({
				patients: patients
			});

		} else {
			console.error("[Visit]->topLevelPatientStateChange(): Missing patient ID " + patientID + " in Visit patients state");
		}
	},

	/*
	 *
	 */
	topLevelStoreResource: function(resourceID, resource) {
		console.log("[Visit]->topLevelStoreResource(): resourceID=" + resourceID + ", resource=" + resource);

		var resources = this.state.resources;
			resources[resourceID] = resource;

		this.setState({
			resources: resources
		});
	},

	/*
	 * Render Visit container
	 */
	render: function() {
		var props = this.props,
			state = this.state;

		return (
			React.createElement("div", {className: "row"}, 
				React.createElement(Visit.FinishModal, {
					stages: props.stages, 
					onConfirmFinishVisit: this.handleConfirmFinishVisit}), 

				React.createElement(Visit.PatientsOverview, {
					fields: props.patientFields, 
					patients: state.patients, 
					mini: false, 
					resources: state.resources}), 

				React.createElement(Visit.PatientsContainer, {
					_token: props._token, 
					controlsType: props.controlsType, 
					containerTitle: props.containerTitle, 
					stageType: props.currentStageType, 
					visitID: props.visitID, 

					summaryFields: props.summaryFields, 
					fields: props.mutableFields, 
					patients: state.patients, 
					prescriptions: state.prescriptions, 

					isSubmitting: state.isSubmitting, 
					progress: state.progress, 
					confirmFinishVisitResponse: state.confirmFinishVisitResponse, 

					onFinishVisit: this.handleFinishVisit, 
					onPatientAdd: this.handlePatientAdd, 
					onPatientDataChange: this.topLevelPatientStateChange, 
					onStoreResource: this.topLevelStoreResource})
			)
		);
	}

});

/*
 * Variables
 */
Visit.generatedFields = {
	"generatedHeader": {
		name: "Generated",
		type: "header"
	},
	"age": {
		name: "Age",
		type: "number"
	}
};

/*
 * Patients management (main content)
 *
 * Properties:
 *  - _token: 			Laravel CSRF token
 *  - controlsType: 	determine which controls set to use
 *  - containerTitle: 	Title for patients container
 *
 *  - fields: 			All fields for this stage
 *  - patients:  		All patients in this visit
 *
 * 	- isSubmitting:  	is the parent form in submission state?
 *
 *  - onFinishVisit:  	Bubble onFinishVisit event up to Visit container
 *  - onPatientAdd: 	Bubble onPatientAdd event up to Visit container
 *  - onPatientDataChange: Bubble onPatientDataChange event up to Visit container
 *  - onStoreResource: Bubble onStoreResource event up to Visit container
 */
Visit.PatientsContainer = React.createClass({displayName: "PatientsContainer",

	/*
	 * Initially, the container isn't loading
	 */
	getInitialState: function() {
		return {
			showImportBlock: false,
			isLoading: false
		}
	},

	/*
	 * Set state to loading
	 */
	isLoading: function(val) {
		this.setState({
			isLoading: val
		});
	},

	/*
	 * Handle finishing the visit
	 */
	onFinishVisit: function() {
		console.log("PatientsContainer: onFinishVisit");
		this.isLoading(true);
		this.props.onFinishVisit(this.isLoading(false));
	},

	/*
	 * Add a bare patient record
	 */
	handlePatientAddfromScratch: function(patientData) {
		var data;
		if(arguments.length > 0 && patientData !== null && typeof patientData === "object") {
			console.log('args.length = ' + arguments.length);
			console.log('patientData === null: ' + patientData === null);
			console.log('typeof patientData:' + typeof patientData);
			console.log(patientData);
			data = {
				"_token": this.props._token,
				"importedFieldData": patientData
			};
		} else {
			data = {
				"_token": this.props._token,
			};
		}

		// Set state as loading
		this.isLoading(true);

		$.ajax({
			type: "POST",
			url: "/patients/create",
			data: data,
			success: function(resp) {
				console.log("success");
				if(resp.status == "success") {
					this.props.onPatientAdd(resp.patient);
				}
			}.bind(this),
			error: function(resp) {
				console.log("handlePatientAddfromScratch: error");
				console.log(resp);
				// console.log(resp);
			},
			complete: function() {
				this.isLoading(false);
			}.bind(this)
		});

	},
	handlePatientAdd: function(patient) {
		if(patient.hasOwnProperty('field_number') && patient.field_number !== null) {
			this.handlePatientAddfromScratch(patient);
		} else {
			this.props.onPatientAdd(patient);
		}
	},

	handleShowImportBlock: function() {
		this.setState({
			showImportBlock: true
		});
	},
	handleCloseImportBlock: function() {
		this.setState({
			showImportBlock: false
		});
	},

	render: function() {

		var props = this.props,
			state = this.state,
			isLoading = (state.isLoading || props.isSubmitting),
			patients = (props.hasOwnProperty('patients') ? props.patients : {}),
			patientIDs = Object.keys(patients),
			patientsCount = patientIDs.length,
			patientsDOM,
			importBlock,
			controls;

		console.group("Visit.PatientsContainer: render");
			console.log("Showing import block: %s", state.showImportBlock);
			console.log("Patient IDs: %O", patientIDs);
			console.log("Patients count: %i", patientsCount);

		// Loading state can be triggered by:
		// 		isLoading 		-> provided by controls, procs when adding new patient / importing
		// 		isSubmitting 	-> provided by container, procs when visit is submitted to next stage

		// If we're submitting, don't show patients block
		if(!props.isSubmitting) {

			// Set up patients block
			if(patientsCount > 0) {

				// Build patients DOM
				patientsDOM = patientIDs.map(function(patientID, index) {

					var thisPatient = patients[patientID];

					console.groupCollapsed("Fieldset #%i: Patient %s", index, patientID);
						console.log("Fields: %O", props.fields);
						console.log("This patient: %O", thisPatient);

					var patientDOM = (
						React.createElement("div", {key: patientID}, 
							React.createElement(Visit.Patient, {
								/*
								 * Stage type
								 */
								stageType: props.stageType, 
								
								/*
								 * Visit
								 */
								visitID: props.visitID, 

								/*
								 * Patient record
								 */
								patient: thisPatient, 
								id: patientID, 
								index: index, 

								/*
								 * All available fields
								 */
								fields: props.fields, 

								/*
								 * Fields to summarize at the top of each patient
								 */
								summaryFields: props.summaryFields, 

								/*
								 * Event handlers
								 */
								onPatientDataChange: props.onPatientDataChange, 
								onStoreResource: props.onStoreResource}), 
							React.createElement("hr", null)
						)
					);

					console.groupEnd(); // End: "#%i: Patient [patientID]"

					// Push back to patientsDOM
					return patientDOM;

				}.bind(this));
			} else {
				patientsDOM = (
					React.createElement("div", {className: "alert alert-info"}, 
						"There are currently no patients in this visit."
					)
				);
			}
		} else {
			// Scroll to top of window
			window.scrollTo(0, 0);
		}

		// Set up import block
		if(state.showImportBlock) {
			importBlock = (
				React.createElement(Visit.ImportBlock, {
					_token: props._token, 

					onPatientAdd: this.handlePatientAdd, 
					onClose: this.handleCloseImportBlock})
			);
		}

		// Set up controls block
		switch(props.controlsType) {
			case "new-visit":
				// We're on the new visit page
				controls = (
					React.createElement(Visit.NewVisitControls, {
						isLoading: isLoading, 
						isImportBlockVisible: state.showImportBlock, 

						onFinishVisit: this.onFinishVisit, 
						onPatientAddFromScratch: this.handlePatientAddfromScratch, 
						onShowImportBlock: this.handleShowImportBlock})
				);
				break;
			case "stage-visit":
				// We're on some sort of stage page
				controls = (
					React.createElement(Visit.StageVisitControls, {
						isLoading: isLoading, 

						onFinishVisit: this.onFinishVisit})
				);
				break;
		}

		// Add messages as necessary
		var message;
		if(isLoading == true) {

			// If we have a progress value
			if(props.progress > 0) {
				var percent = props.progress.toFixed(1);
				message = (
					React.createElement("div", null, 
						React.createElement("div", {className: "alert alert-info"}, 
							React.createElement("strong", null, "One moment...")
						), 
						React.createElement("progress", {className: "progress progress-striped progress-animated", value: percent, max: "100"}, 
							percent, "%"
						)
					)
				);
			} else {
				message = (
					React.createElement("div", {className: "alert alert-info"}, 
						React.createElement("strong", null, "One moment...")
					)
				);
			}

		} else {
			// We aren't loading, perhaps there was already a response?
			var response = props.confirmFinishVisitResponse;
			if(response !== null) {
				if(response.status == "success") {
					var link;
					if(response.toStage !== "__checkout__") {

						link = (
							React.createElement("a", {href: "/visits/stage/" + response.toStage + "/handle/" + response.visitID, className: "btn btn-link"}, 
								"Follow this visit"
							)
						);
					}
					message = (
						React.createElement("div", {className: "alert alert-success"}, 
							React.createElement("strong", null, "Awesome!"), " ", response.message, " ", link
						)
					);
				} else {
					var errorListItems = response.errors.map(function(error, index) {
						return (
							React.createElement("li", {key: index}, error)
						);
					});
					message = (
						React.createElement("div", {className: "alert alert-danger"}, 
							React.createElement("strong", null, "An error occurred:"), " ", response.message, 
							React.createElement("ul", null, errorListItems)
						)
					);
				}
			}
		}

		console.log("Ending PatientsContainer group...");
		console.groupEnd(); // End: 'Visit.PatientsContainer: render'

		return (
			React.createElement("div", {className: "col-xs-12 col-sm-12 col-md-8 col-xl-9"}, 
	            React.createElement("h1", {className: "p-t text-xs-center"}, props.containerTitle), 
	            React.createElement("hr", null), 
            	message, 
            	patientsDOM, 
            	importBlock, 
            	controls
	        )
		);
	}
});

/*
 * Display the controls for the new visit page
 *
 * Properties:
 *  - isLoading: boolean, is the container engaged in some sort of loading / modal process
 *  - isImportBlockVisible: if the import block is visible, disable the button
 *
 *  - onFinishVisit: callback for finishing visit
 *  - onPatientAddFromScratch: callback for clicking "Create new patient record"
 *  - onShowImportBlock: callback for showing the import block within PatientsContainer
 */
Visit.NewVisitControls = React.createClass({displayName: "NewVisitControls",
	handlePatientAddFromScratch: function() {
		return this.props.onPatientAddFromScratch(null);
	},
	render: function() {

		var props = this.props,
			loadingGifClasses = ("m-x loading" + (props.isLoading == false ? " invisible" : ""));

		return (
			React.createElement("div", {className: "btn-toolbar", role: "toolbar"}, 
				React.createElement("div", {className: "btn-group btn-group-lg p-b"}, 
		        	React.createElement("button", {type: "button", className: "btn btn-primary", disabled: props.isLoading, onClick: this.handlePatientAddFromScratch}, '\u002b', " New"), 
		        	React.createElement("button", {type: "button", className: "btn btn-default", disabled: props.isLoading || props.isImportBlockVisible, onClick: props.onShowImportBlock}, '\u21af', " Import")
		        	), 
	        	React.createElement("div", {className: "btn-group btn-group-lg"}, 
	        		React.createElement("img", {src: "/assets/img/loading.gif", className: loadingGifClasses, width: "52", height: "52"}), 
	        		React.createElement("button", {type: "button", className: "btn btn-success", disabled: props.isLoading, onClick: props.onFinishVisit}, '\u2713', " Finish visit")
	        	)
	        )
	    );
	}

});


/*
 * Display the controls for the stage page
 *
 * Properties:
 *  - isLoading: boolean, is the container engaged in some sort of loading / modal process
 *
 *  - onFinishVisit: callback for finishing visit
 */
Visit.StageVisitControls = React.createClass({displayName: "StageVisitControls",

	render: function() {

		var props = this.props,
			loadingGifClasses = ("m-x" + (props.isLoading == false ? " invisible" : ""));

		return (
			React.createElement("div", {className: "btn-toolbar", role: "toolbar"}, 
				React.createElement("div", {className: "btn-group btn-group-lg"}, 
		        	React.createElement("img", {src: "/assets/img/loading.gif", className: loadingGifClasses, width: "52", height: "52"}), 
	        		React.createElement("button", {type: "button", className: "btn btn-success", disabled: props.isLoading, onClick: props.onFinishVisit}, "Finish visit »")
		        )
	        )
	    );
	}

});

/**
 * visit/Import.jsx
 * @author Cameron Kelley
 *
 * Properties:
 */
Visit.ImportBlock = React.createClass({displayName: "ImportBlock",

	getInitialState: function() {
		return {
			display: 'form',
			patientsFound: [],

			name: null,
			forceptID: null,
			fieldNumber: null,
		}
	},

	handleInputChange: function(input) {
		return function(event) {
			var state = this.state;
				state[input] = event.target.value;
			this.setState(state);
		}.bind(this);
	},

	handleSearch: function(type) {
		this.setState({
			display: 'searching'
		});

		$.ajax({
			type: "POST",
			url: "/patients/search",
			data: {
				_token: this.props._token,
				by: type,
				for: this.state[type]
			},
			success: function(resp) {
				this.setState({
					display: 'results',
					patientsFound: resp.patients
				});
			}.bind(this),
			error: function(resp) {

			},
			complete: function(resp) {

			}
		});
	},
	handlePatientAdd: function(patient) {
		return function(event) {
			this.props.onPatientAdd(patient);
			this.resetDisplay();
		}.bind(this);
	},

	resetDisplay: function() {
		this.setState(this.getInitialState());
	},

	doSearchName: function() {
		this.handleSearch("name");
	},
	doSearchForceptID: function() {
		this.handleSearch("forceptID");
	},
	doSearchFieldNumber: function() {
		this.handleSearch("fieldNumber");
	},

	render: function() {

		var state = this.state,
			props = this.props,
			display;

		switch(state.display) {
			case "form":
				display = (
					React.createElement("fieldset", {className: "form-group m-b-0"}, 
						React.createElement("label", {className: "form-control-label hidden-sm-up"}, "...by field number:"), 
						React.createElement("div", {className: "input-group input-group-lg m-b"}, 
	    					React.createElement("input", {type: "number", className: "form-control", placeholder: "Search for a patient by field number...", value: state.fieldNumber, onChange: this.handleInputChange("fieldNumber")}), 
							React.createElement("span", {className: "input-group-btn"}, 
								React.createElement("button", {className: "btn btn-secondary", type: "button", disabled: state.fieldNumber == null, onClick: this.doSearchFieldNumber}, "Search")
							)
						), 
						React.createElement("label", {className: "form-control-label hidden-sm-up"}, "...by Forcept ID:"), 
						React.createElement("div", {className: "input-group input-group-lg m-b"}, 
	    					React.createElement("input", {type: "number", className: "form-control", placeholder: "Search for a patient by Forcept ID...", min: "100000", value: state.forceptID, onChange: this.handleInputChange("forceptID")}), 
							React.createElement("span", {className: "input-group-btn"}, 
								React.createElement("button", {className: "btn btn-secondary", type: "button", disabled: state.forceptID == null, onClick: this.doSearchForceptID}, "Search")
							)
						), 
						React.createElement("label", {className: "form-control-label hidden-sm-up"}, "...by first or last name:"), 
						React.createElement("div", {className: "input-group input-group-lg"}, 
	    					React.createElement("input", {type: "text", className: "form-control", placeholder: "Search for a patient by first or last name...", value: state.name, onChange: this.handleInputChange("name")}), 
							React.createElement("span", {className: "input-group-btn"}, 
								React.createElement("button", {className: "btn btn-secondary", type: "button", disabled: state.name == null || state.name.length == 0, onClick: this.doSearchName}, "Search")
							)
						)
					)
				);
				break;
			case "searching":
				display = (
					React.createElement("h2", null, 
						React.createElement("img", {src: "/assets/img/loading.gif", className: "m-r"})
					)
				);
				break;
			case "results":
				if(state.patientsFound.length == 0) {
					display = (
						React.createElement("div", {className: "alert alert-info"}, 
							"No patients found. ", React.createElement("a", {className: "alert-link", onClick: this.resetDisplay}, "Try again?")
						)
					)
				} else {
					display = (
						React.createElement("div", {className: "row"}, 
							state.patientsFound.map(function(patient, index) {
								var currentVisit,
									disabled = false;
								if(patient.hasOwnProperty('current_visit') && patient.current_visit !== null) {
									disabled = true;
									currentVisit = (
										React.createElement("li", {className: "list-group-item bg-danger"}, 
											React.createElement("small", null, "Patient currently in a visit!")
										)
									);
								} else if(patient.hasOwnProperty('used') && patient.used !== null) {
									if(patient.used) {
										currentVisit = (
											React.createElement("li", {className: "list-group-item"}, 
												React.createElement("h6", null, "Note: this record is associated with the following user ID:"), 
												React.createElement("span", {className: "label label-default"}, patient.used)
											)
										)
									}
								}
								return (
									React.createElement("div", {className: "col-xs-12 col-sm-6", key: "patients-found-" + index}, 
										React.createElement("div", {className: "card"}, 
											React.createElement("div", {className: "card-header"}, 
												React.createElement("h5", {className: "card-title"}, 
													React.createElement("span", {className: "label label-default pull-right"}, patient.hasOwnProperty('field_number') ? patient.field_number : patient.id), 
													React.createElement("span", {className: "label label-primary pull-right"}, "#", index + 1), 
													React.createElement("span", {className: "title-content"}, Utilities.getFullName(patient))
												)
											), 
											React.createElement("ul", {className: "list-group list-group-flush"}, 
												currentVisit
											), 
											React.createElement("div", {className: "card-block"}, 
												React.createElement("button", {type: "button", className: "btn btn-block btn-primary", disabled: disabled, onClick: this.handlePatientAdd(patient)}, 
													'\u002b', " Add"
												)
											)
										)
									)
								);
							}.bind(this)), 
							React.createElement("div", {className: "col-xs-12 col-sm-6"}, 
								React.createElement("div", {className: "card"}, 
									React.createElement("div", {className: "card-block"}, 
										React.createElement("button", {type: "button", className: "btn btn-block btn-secondary", onClick: this.resetDisplay}, 
											'\u21b5', " Go back"
										)
									)
								)
							)
						)
					);
				}

				break;
			default:
				break;
		}

		return (
			React.createElement("blockquote", {className: "blockquote"}, 
				React.createElement("h3", null, 
					'\u21af', " Import a patient", 
					React.createElement("button", {type: "button", className: "close pull-right", "aria-label": "Close", onClick: props.onClose}, 
					    React.createElement("span", {"aria-hidden": "true"}, "×")
					 )
				), 
				React.createElement("hr", null), 
				display
			)
		);
	}
});

/*
 * Modal that appears upon clicking "Finish visit"
 *
 * Properties
 *   - stages: array of stage objects (in order of 'order')
 *   - currentStage: current stage id
 *   - onConfirmFinishVisit: handler function for logic after moving patients
 */
Visit.FinishModal = React.createClass({displayName: "FinishModal",

	getInitialState: function() {
		return {
			isSubmitting: false,
		};
	},

	/*
	 * onComplete
	 */
	onComplete: function() {
		this.setState({
			isSubmitting: true
		});
		this.props.onConfirmFinishVisit(this.state.destination, this);
	},

	/*
	 * Handle destination change
	 */
	handleDestinationChange: function(destination) {
		return function(event) {
			console.log("[Visit.FinishModal] Changing destination to " + destination);
			this.setState({
				destination: destination
			});
		}.bind(this);
	},

	/*
	 * Check if a default value is going to be set
	 */
	componentWillMount: function() {
		this.resetSelectState();
	},

	resetSelectState: function() {

		var props = this.props;

		// Set default value as the first stage in the array (the next stage in order above the current one)
		if(props.hasOwnProperty('stages') && props.stages !== null && props.stages.length > 0) {
			this.setState({ destination: props.stages[0].id });
		} else {
			this.setState({ destination: "__checkout__" });
		}
	},

	/*
	 * Render the modal
	 */
	render: function() {

		var props = this.props,
			state = this.state,
			destinations,
			buttonText,
			defaultValue,
			stageNameKeyPairs = {};

		// Check if stages are defined, use them as destinations
		// NOTE: stages are in order of ORDER, not ID
		if(props.hasOwnProperty('stages') && props.stages.length > 0) {
			destinations = props.stages.map(function(stage, index) {
				stageNameKeyPairs[stage.id] = stage.name;
				return (
					React.createElement("label", {className: "btn btn-secondary btn-block" + (stage.id == state.destination ? " active" : ""), key: "finish-modal-option" + index, onClick: this.handleDestinationChange(stage['id'])}, 
						React.createElement("input", {type: "radio", name: "destination", defaultChecked: stage.id == state.destination}), 
						stage.id == state.destination ? "\u2713" : "", " ", stage.name
					)
				);
			}.bind(this));
		}

		// Change button text based on modal state
		if(state.isSubmitting == true) {
			buttonText = "Working...";
		} else {
			if(state.destination == "__checkout__") {
				buttonText = "Check-out patients";
			} else {
				buttonText = "Move patients to " + (state.destination !== null ? stageNameKeyPairs[state.destination] : stageNameKeyPairs[defaultValue]);
			}
		}

		return (
			React.createElement("div", {className: "modal fade", id: "visit-finish-modal"}, 
			    React.createElement("div", {className: "modal-dialog modal-sm", role: "document"}, 
			        React.createElement("div", {className: "modal-content"}, 
			            React.createElement("div", {className: "modal-header"}, 
			                React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close"}, 
			                  React.createElement("span", {"aria-hidden": "true"}, "×")
			                ), 
			                React.createElement("h4", {className: "modal-title"}, "Move visit to...")
			            ), 
			            React.createElement("div", {className: "modal-body"}, 
			            	React.createElement("div", {className: "btn-group-vertical btn-group-lg", style: {display: "block"}, "data-toggle": "buttons"}, 
			            		destinations, 
								React.createElement("label", {className: "btn btn-secondary btn-block" + ("__checkout__" == state.destination ? " active" : ""), onClick: this.handleDestinationChange("__checkout__")}, 
									React.createElement("input", {type: "radio", name: "destination", defaultChecked: "__checkout__" == state.destination}), 
									"__checkout__" == state.destination ? "\u2713" : "", " Check-out"
								)
			            	)
			            ), 
			            React.createElement("div", {className: "modal-footer"}, 
			                React.createElement("button", {type: "button", className: "btn btn-success", disabled: state.isSubmitting == true, onClick: this.onComplete}, 
			                	buttonText
			                )
			            )
			        )
			    )
			)
		);
	}

});

/*
 * Patients overview (left sidebar)
 *
 * Accepted properties:
 * - fields: Object of ALL fields for ALL stages up to THIS CURRENT STAGE for displaying patient metadata
 * - patients: Object of patients w/ data as pulled from database
 *
 * - mini: should this display as a card instead of a column
 */
Visit.PatientsOverview = React.createClass({displayName: "PatientsOverview",

	/*
	 * Render patient overview blocks
	 */
	render: function() {

		var props = this.props,
			patientKeys = Object.keys(props.patients),
			countPatients = patientKeys.length,
			patientOverviews,
			iterableFields;

		console.group("Visit.PatientsOverview: render (mini=%s)", props.mini);
			console.log("Patients to overview: %i", countPatients);
			console.log("Properties: %O", props);

		// Copy the local patient fields property to a new variable
		// and remove first/last name, so they don't appear in the list
		if(props.mini == true) {
			iterableFields = jQuery.extend({}, props.fields);
		} else {
			iterableFields = jQuery.extend(jQuery.extend({}, props.fields), Visit.generatedFields);
		}

		// Remove fields that are displayed differently than normal
		delete iterableFields["first_name"];
		delete iterableFields["last_name"];
		delete iterableFields["photo"];

		// If there are patients in the props object
		if(countPatients > 0) {

			//-- Begin mapping patient keys --\\
			patientOverviews = patientKeys.map(function(patientID, index) {
				var cardHeader,
					photo,
					thisPatient = props.patients[patientID];

				console.groupCollapsed("Card #%i: Patient %s", index, patientID);

				//-- Begin search for patient photo --\\
				if(thisPatient.hasOwnProperty('photo') && thisPatient.photo !== null) {

					console.group("Photo:");
						console.log("This patient has a photo property.");

					var resourceKeys,
						resources = props.hasOwnProperty("resources") ? props.resources : {};

					try {
						if(typeof thisPatient.photo === "string") {
							console.log("The photo property is a STRING");

							// Attempt to..
							try {
								// Parse JSON from database as string
								resourceKeys = JSON.parse(thisPatient.photo);
							} catch(e) {
								console.error("Failed to parse photo string into JSON array.");
								resourceKeys = [];
							}

						} else {
							console.log("The photo property is NOT a STRING");
							console.info("Photo property type: %s", typeof thisPatient.photo);

							// Otherwise, just push the object
							resourceKeys = thisPatient.photo;
						}
					} catch(e) {
						console.error("Some sort of error parsing photo string (not a JSON error...)");
						resourceKeys = [];
					}

					if(resourceKeys.length > 0) {

						// Since Photo field only allows one upload, we'll grab the first key in the array
						// (it's probably the only key...)
						var photoKey = resourceKeys[0];

						console.log("Photo resource ID is %i, checking resource storage...", photoKey);

						// Check if we have this resource in storage already.
						if(resources.hasOwnProperty(photoKey)) {

							// For the immutable Photo input, the one and only file is the patient photo.
							var photoData = resources[photoKey];

							console.log("Photo found in preloaded resources: %O", photoData);

							photo = (
								React.createElement(Fields.Resource, {
									id: photoKey, 
									resource: { type: "image/jpeg", base64: photoData.data}})
							);

						} else {
							console.log("Photo not found in resources, creating resource object with instructions to grab resource via AJAX");

							photo = (
								React.createElement(Fields.Resource, {
									id: photoKey, 
									resource: { type: "image/jpeg"}})
							);
						}
					}

					console.groupEnd(); // End "Photo:"

				}
				//-- End photo search --\\

				// Show header if we're not in Mini mode
				if(props.mini === false) {
					cardHeader = (
						React.createElement("span", null, 
			               	React.createElement("div", {className: "card-header"}, 
			                    React.createElement("span", {className: "label label-info"}, "#", index + 1), 
			                    React.createElement("span", {className: "label label-default"}, patientID)
			                ), 
			                React.createElement("div", {className: "card-block"}, 
			                	React.createElement("h4", {className: "card-title text-xs-center m-a-0"}, 
			                		React.createElement("strong", null, 
										Utilities.getFullName(thisPatient)
									)
			                	)
			                ), 
			                photo
			            )
			        );
				}

				//-- Begin render patient card --\\
				var patientCardDOM = (
					React.createElement("div", {className: "card forcept-patient-summary", key: patientID}, 
						cardHeader, 
		              	React.createElement("div", {className: "list-group list-group-flush"}, 
		                    Object.keys(iterableFields).map(function(field, index) {

		                    	var thisIterableField = iterableFields[field],
									foundData = false,
									isGeneratedField = Visit.generatedFields.hasOwnProperty(field),
									value = "No data",
									icon;

								console.group("Field #%i: %s", index, thisIterableField.name);


								//-- Begin patient field checking --\\
		                    	if(
		                    		thisPatient.hasOwnProperty(field) 	// If this field exists in the patient data
		                    		&& thisPatient[field] !== null	 	// If the data for this field is null, show "No data"
		                    		&& thisPatient[field].length > 0	// If string length == 0 or array length == 0, show "No data"
		                    	) {

									var thisPatientField = thisPatient[field];

									console.info("Patient data: %O", thisPatientField);

		                    		if(!(props.mini == true && isGeneratedField)) // Don't show generated fields in Mini mode
		                    		{
			                    		if( ["string", "number"].indexOf(typeof thisPatientField) !== -1 ) // If the field is a string or number
			                    		{

			                    			// We found data!
			                    			foundData = true;

											// Grab field types
											var fieldType = thisIterableField.type;

											console.log("Type: %s", fieldType);

			                    			// We might need to mutate the data
			                    			switch(fieldType) {

												/**
												 * Date input
												 */
												case "date":
													// if(thisIterableField.hasOwnProperty('settings') && thisIterableField.settings.hasOwnProperty('useBroadMonthSelector') && isTrue(thisIterableField.settings.useBroadMonthSelector)) {
													// 	var date = new Date(),
													// 		split = thisPatientField.toString().split("/"); // mm/dd/yyyy
													//
													// 		date.setMonth(parseInt(split[0]) - 1, split[1]);
													// 		date.setFullYear(split[2]);
													//
													// 	value = Utilities.timeAgo(
													// 		date
													// 	);
													// } else {
														value = thisPatientField.toString();
													// }
													break;

			                    				/**
			                    				 * Things with multiple lines
			                    				 */
			                    				case "textarea":
			                    					value = (
			                    						React.createElement("p", {dangerouslySetInnerHTML: { __html: thisPatientField.replace(/\n/g, "<br/>")}})
			                    					);
			                    					break;

			                    				/**
			                    				 * Things stored as arrays
			                    				 */
			                    				case "multiselect":
			                    					// Convert from JSON array to nice string
													var arr;
			                    					try {
														arr = JSON.parse(thisPatientField);
													} catch(e) {
														arr = [];
													}


													// Make sure it worked
			                    					if(Array.isArray(arr) && arr.length > 0) {
			                    						value = (
															React.createElement("ul", {className: "list-unstyled"}, 
																arr.map(function(optionValue, optionIndex) {
																	return (
																		React.createElement("li", {key: [optionValue, optionIndex].join("-")}, 
																			'\u26ac', " ", optionValue
																		)
																	);
																})
															)
														);
			                    					}

			                    					console.log("Multiselect value: %s", value);

			                    					break;

			                    				/**
			                    				 * Things stored as base64
			                    				 */
			                    				case "file":

													// Convert from JSON array to nice string
													var arr;
													try {
														arr = JSON.parse(thisPatientField);
													} catch(e) {
														console.error("Failed to convert file resource array from string to array.");
														arr = [];
													}

													value = arr.map(function(resourceID, index) {
														return (
															React.createElement(Fields.Resource, {
																id: resourceID})
														);
													});

			                    					break;

												case "pharmacy":
													value = (
														React.createElement("span", {className: "label label-default"}, 
															"Set ID: ", thisPatientField.toString()
														)
													);
													break;

			                    				/**
			                    				 * Everything else (single-value data points)
			                    				 */
			                    				default:
			                    					value = thisPatientField.toString();
			                    					break;
			                    			}
			                    		} else {
											console.warning("Field isn't a string or number..");
			                    			if( Array.isArray(thisPatientField) ) // If the data is an array
			                    			{
												console.info("We're good, it's an array!");
			                    				// We found data!
			                    				foundData = true;
			                    				value = thisPatientField.join(", ");
			                    			} else {
			                    				// WTF is it?
			                    				console.error("WARNING: unknown field data type");
			                    			}
			                    		}
			                    	}
		                    	}
								//-- End patient field checking --\\


		                    	// Choose which icon to display
		                    	if(!isGeneratedField) {
		                    		if(foundData) {
		                    			icon = (
		                    				React.createElement("span", {className: "text-success"}, 
		                    					"\u2713"
		                    				)
		                    			);
		                    		} else {
		                    			icon = (
		                    				React.createElement("span", {className: "text-danger"}, 
		                    					"\u2717"
		                    				)
		                    			);
		                    		}
		                    	} else {
		                    		icon = "\u27a0";
		                    	}

								console.groupEnd(); // End: "Field %i..."

								// NOTE: maybe keep this?
								if(foundData) {
			                    	// Render the list item
			                    	if(thisIterableField.type == "header") {
			                    		if(props.mini == false) {
				                    		return (
				                    			React.createElement("div", {className: "list-group-item forcept-patient-overview-header-item", key: field + "-" + index}, 
				                    				React.createElement("h5", {className: "text-center m-a-0"}, 
				                    					thisIterableField.name
				                    				)
				                    			)
				                    		);
				                    	}
			                    	} else {
										return (
											React.createElement("div", {className: "list-group-item", key: field + "-" + index}, 
												React.createElement("dl", null, 
													React.createElement("dt", null, icon, "   ", thisIterableField.name), 
													React.createElement("dd", null, foundData ? value : "")
												)
											)
										);
			                    	}
								}
	                    	}.bind(this))
		                )
					)
				);
				//-- End build patient card DOM --\\

				console.groupEnd(); // End "Patient %i"

				// Return the patient card DOM
				return patientCardDOM;

			}.bind(this));
			//-- End patient fields map --\\

		} else { //-- end: if there are patients in the patient object --\\
			patientOverviews = (
				React.createElement("div", {className: "alert alert-info hidden-sm-down"}, 
					"No patients within this visit."
				)
			);
		}

		console.log("Done with PatientOverview group...");
		console.groupEnd(); // End: "PatientsOverview"

		// If we're in mini mode, use different column structure
		if(props.mini == true) {
			return (
		        React.createElement("div", {className: "col-xs-12 col-lg-6"}, 
		           patientOverviews
		        )
			);
		} else return (
	        React.createElement("div", {className: "col-xs-12 col-sm-12 col-md-4 col-xl-3"}, 
	           patientOverviews
	        )
	    );
	}

});

/*
 * Display specified fields relative to this patient
 *
 * Properties:
 */
Visit.Patient = React.createClass({displayName: "Patient",

	/*
	 *
	 */
	handleFieldChange: function(fieldID, value) {
		// Continue bubbling event from Fields.whatever to top-level Visit container
		// (this element passes along the patient ID to modify)
		this.props.onPatientDataChange(this.props.id, fieldID, value);
	},

	/*
	 *
	 */
	handleStoreResource: function(resourceID, resource) {
		// Continue bubbling event from Fields.whatever to top-level Visit container
		// (this element passes along the patient ID to modify)
		this.props.onStoreResource(resourceID, resource);
	},

	/*
	 *
	 */
	render: function() {

		var props = this.props,
			state = this.state,
			fields = props.fields,
			fieldKeys = Object.keys(fields),
			countFields = fieldKeys.length,
			summaryFields = props.summaryFields,
			summaryFieldsKeys = Object.keys(summaryFields),
			countSummaryFields = summaryFieldsKeys.length,
			name = props.patient.full_name !== null ? props.patient.full_name : "Unnamed patient",
			summary;

		console.groupCollapsed("Visit.Patient: render");
			console.log("Stage type: %s", props.stageType);
			console.log("Iterable field count: %i", countFields);
			console.log("Iterable field keys: %O", fieldKeys);
			console.log("Summary field count : %i", countSummaryFields);

		// Build summary DOM
		if(summaryFields !== null && typeof summaryFields === "object" && countSummaryFields > 0) {

			var leftColumnFields = {},
				rightColumnFields = {},
				patientsObjectSpoof = {};

			patientsObjectSpoof[props.patient.patient_id] = props.patient;

			summaryFieldsKeys.map(function(key, index) {
				if(index > (countSummaryFields - 1) / 2) {
					rightColumnFields[key] = summaryFields[key];
				} else {
					leftColumnFields[key] = summaryFields[key];
				}
			}.bind(this));

			console.log("Left column: %O", leftColumnFields);
			console.log("Right column: %O", rightColumnFields);

			summary = (
				React.createElement("div", {className: "row"}, 
					React.createElement(Visit.PatientsOverview, {
						fields: leftColumnFields, 
						patients: patientsObjectSpoof, 
						mini: true}), 
					React.createElement(Visit.PatientsOverview, {
						fields: rightColumnFields, 
						patients: patientsObjectSpoof, 
						mini: true})
				)
			);
		}

		var fieldsDOM;

		if(props.stageType === "pharmacy") {
			console.group("Running pharmacy loop.");

				// Loop through summary fields instead of actual fields.
				fieldsDOM = summaryFieldsKeys.map(function(fieldID, index) {

					var fieldDOM,
						thisField = summaryFields[fieldID],
						thisPatient = props.patient,
						defaultValue = thisPatient.hasOwnProperty(fieldID) ? thisPatient[fieldID] : null;

					console.groupCollapsed("Field #%i: '%s' %O", index, thisField.name, thisField);
						console.log("Type: %s", thisField.type);
						console.log("Default value: %s", defaultValue);

					// Mutate data as necessary per field type
					if(thisField.type === "pharmacy") {
						console.log("-> found a pharmacy-type");
						fieldDOM = (
							React.createElement(Fields.Pharmacy, React.__spread({}, 
								thisField, 
								{patientID: props.id, 
								visitID: props.visitID, 
								defaultValue: defaultValue, 
								onChange: this.handleFieldChange, 
								key: fieldID, 
								id: fieldID}))
						);
					}

					console.groupEnd();

					// Return fieldDOM back to map function
					return fieldDOM;

				}.bind(this));

			console.groupEnd();
		} else {
			fieldsDOM = fieldKeys.map(function(fieldID, index) {

				var fieldDOM,
					thisField = fields[fieldID],
					thisPatient = props.patient,
					defaultValue = thisPatient.hasOwnProperty(fieldID) ? thisPatient[fieldID] : null;

				console.groupCollapsed("Field #%i: '%s' %O", index, thisField.name, thisField);
					console.log("Type: %s", thisField.type);
					console.log("Default value: %s", defaultValue);

				// Mutate data as necessary per field type
				switch(thisField.type) {
					// Fields stored as JSON arrays
					case "multiselect":
					case "file":
						if(defaultValue !== null && typeof defaultValue === "string") {
							try {
								defaultValue = JSON.parse(defaultValue)
							} catch(e) {
								console.error("Attempt to convert this field's data into an array failed.");
								defaultValue = [];
							}
						}
						break;
				}

				// Figure out which type of field we should render
				switch(thisField.type) {

					/*
					 * Input field types
					 */
					case "text":
						fieldDOM = (
							React.createElement(Fields.Text, React.__spread({}, 
								thisField, 
								{defaultValue: defaultValue, 
								onChange: this.handleFieldChange, 
								key: fieldID, 
								id: fieldID}))
						);
						break;
					case "textarea":
						fieldDOM = (
							React.createElement(Fields.Textarea, React.__spread({}, 
								thisField, 
								{defaultValue: defaultValue, 
								onChange: this.handleFieldChange, 
								key: fieldID, 
								id: fieldID}))
						);
						break;
					case "number":
						fieldDOM = (
							React.createElement(Fields.Number, React.__spread({}, 
								thisField, 
								{defaultValue: defaultValue, 
								onChange: this.handleFieldChange, 
								key: fieldID, 
								id: fieldID}))
						);
						break;
					case "date":
						fieldDOM = (
							React.createElement(Fields.Date, React.__spread({}, 
								thisField, 
								{defaultValue: defaultValue, 
								onChange: this.handleFieldChange, 
								key: fieldID, 
								id: fieldID}))
						);
						break;
					case "select":
						fieldDOM = (
							React.createElement(Fields.Select, React.__spread({}, 
								thisField, 
								{multiple: false, 
								defaultValue: defaultValue, 
								onChange: this.handleFieldChange, 
								key: fieldID, 
								id: fieldID}))
						);
						break;
					case "multiselect":
						fieldDOM = (
							React.createElement(Fields.Select, React.__spread({}, 
								thisField, 
								{multiple: true, 
								defaultValue: defaultValue, 
								onChange: this.handleFieldChange, 
								key: fieldID, 
								id: fieldID}))
						);
						break;
					case "file":
						fieldDOM = (
							React.createElement(Fields.File, React.__spread({}, 
								thisField, 
								{defaultValue: defaultValue, 
								onChange: this.handleFieldChange, 
								onStore: this.handleStoreResource, 
								key: fieldID, 
								id: fieldID}))
						);
						break;
					case "yesno":
						fieldDOM = (
							React.createElement(Fields.YesNo, React.__spread({}, 
								thisField, 
								{defaultValue: defaultValue, 
								onChange: this.handleFieldChange, 
								key: fieldID, 
								id: fieldID}))
						);
						break;

					/*
					 * Other fields
					 */
					case "header":
						fieldDOM = (
							React.createElement(Fields.Header, React.__spread({}, 
								thisField, 
								{key: fieldID, 
								id: fieldID}))
						);
						break;
					case "pharmacy":
						fieldDOM = (
							React.createElement(Fields.Pharmacy, React.__spread({}, 
								thisField, 
								{patientID: props.id, 
								visitID: props.visitID, 

								onChange: this.handleFieldChange, 
								key: fieldID, 
								id: fieldID}))
						);
						break;

					/*
					 * Field type not recognized
					 */
					default:
						fieldDOM = (
							React.createElement("div", {className: "alert alert-danger"}, 
								React.createElement("strong", null, "Warning:"), " Unrecognized input type ", thisField['type']
							)
						);
						break;
				}

				console.groupEnd(); // "FIeld #..."

				// Return fieldDOM back to map function
				return fieldDOM;

			}.bind(this));
		}
		//-- End switch stage type to determine fieldsDOM output --\\


		console.groupEnd(); // End "Iterable field..."


		var patientBlock = (
			React.createElement("blockquote", {className: "blockquote"}, 
				React.createElement("h3", null, 
					React.createElement("span", {className: "label label-info"}, "#", props.hasOwnProperty('index') ? props.index + 1 : "?"), 
		            React.createElement("span", {className: "label label-default"}, props.hasOwnProperty('id') ? props.id : "?"), "  ", 
		            React.createElement("span", {className: "hidden-xs-down"}, name), 
		            React.createElement("div", {className: "hidden-sm-up p-t"}, name)
		        ), 
		        summary, 
		        React.createElement("hr", null), 
		        fieldsDOM
			)
		);

		console.groupEnd(); // End "Visit.Patient: render"

		// Render the patient block!
		return patientBlock;
	}

});
