/**
 * fields/Pharmacy.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - settings:
 *   - TODO fix this
 */

 Fields.Pharmacy = React.createClass({

    /*
     * Get initial component state.
     * @return Object
     */
	getInitialState: function() {
		return {

            /*
             *
             */
			status: "init",

            /*
             *
             */
			justSaved: false,

            /*
             *
             */
			setID: null,

            /*
             *
             */
			data: {},

            /*
             *
             */
			drugs: {},

            /*
             * "Selected" contains selected drug
             * amounts FOR EACH LOADED setID.
             */
			selected: {},

            /*
             *
             */
            undoable: [],
		};
	},

	/*
	 *
	 */
	componentWillMount: function() {
		console.group("  Fields.Pharmacy: mount");
    		console.log("Props: %O", this.props);
            this.setValue(this.props);
		console.groupEnd();
	},

    /*
     *
     */
    componentWillReceiveProps: function(newProps) {
		console.group("  Fields.Pharmacy: mount");
    		console.log("Props: %O", newProps);
            this.setValue(newProps);
		console.groupEnd();
    },

    /*
     *
     */
    setValue: function(props) {
        // Check if we have a prescription table ID
		if(props.hasOwnProperty('value') && props.value !== null) {
			console.log("Found set ID in props: %s", props.value);
			this.setState({
				setID: props.value
			});
		}
    },

    /*
     *
     */
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

    /*
     *
     */
	managePrescriptionSet: function() {

        /*
         * Display loading gif while we process
         */
        this.setState({
            status: "loading"
        }, function() {

            /*
             * Update drug list
             */
            this.updateList(function() {

                /*
                 * Send POST request for prescription set data
                 */
        		$.ajax({
        			type: "POST",
        			url: "/data/prescription-sets/manage",
        			data: {
        				_token: document.querySelector("meta[name='csrf-token']").getAttribute('value'),
        				patientID: this.props.patientID,
        				visitID: this.props.visitID
        			},

                    /**
                     * AJAX success
                     */
        			success: function(resp) {
        				console.log(resp);

                        /*
                         * Start a new object with which
                         * to update state if prescriptions
                         * are found.
                         */
        				var state = {
        					status: "view",
        					setID: resp.id,
                            selected: this.state.selected
        				};

                        /*
                         * Push selected prescriptions to
                         * state.selected[setID] if found.
                         */
        				if(resp.hasOwnProperty("prescriptions") && resp.prescriptions !== null) {
        					state.selected[state.setID] = resp.prescriptions;
        				} else {
                            state.selected[state.setID] = {};
                        }

        				this.setState(state);

        			}.bind(this)
        		});

            });

        });
	},

	/*
	 * Grab list of drugs from /data/
	 */
	updateList: function(cb) {
		$.ajax({
			type: "GET",
			url: "/data/pharmacy/drugs",

            /**
             * AJAX success
             */
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
					}, cb);
				}
			}.bind(this),

            /**
             * AJAX error
             */
			error: function(resp) {
                console.log(resp);

                /*
                 * Set component status to "error".
                 * DON'T execute cb() as it could
                 * potentially change the component's state.
                 */
                this.setState({
                    status: "error",
                    message: resp.responseJSON.message
                });
			}.bind(this)
		});
	},

    /*
     *
     */
	onSelectedDrugsChange: function(event) {

		var state = this.state;

        if(state.setID !== null) {

            var options = event.target.options,
                selected = state.selected,
    			selectedThisSet = selected[state.setID],
    			alreadySelected = Object.keys(selectedThisSet);

    		console.log("Already selected: %O", selectedThisSet);

    		/*
             * Loop through all target options
             */
    		for(var i = 0; i < options.length; i++) {

    			var thisOption = options[i],
    				thisValue = thisOption.value;

    			/*
                 * If the option is selected in the <select> input and NOT in our "selected" object
                 */
    			if(thisOption.selected && alreadySelected.indexOf(thisValue) === -1) {
    				selectedThisSet[thisValue] = {
    					amount: 1,
    					done: false
    				};
    			} else {

    				/*
                     * Delete an option IF:
    				 * - it's found in the alreadySelected object
    				 * - the option is not selected
    				 * - the option is not marked as done
                     */
    				if(alreadySelected.indexOf(thisValue) !== -1
    					&& !thisOption.selected
    					&& !isTrue(selectedThisSet[thisValue].done)) {
    					delete selectedThisSet[thisValue];
    				}
    			}
    		}

            selected[state.setID] = selectedThisSet;

    		this.setState({
    			selected: selected
    		});
        }
	},

	/*
	 *
	 */
	onSignOff: function(drugKey) {
		return function(event) {

			var state = this.state,
                selected = state.selected,
                selectedThisSet = selected[state.setID],
                undoable = state.undoable;

			if(selected.hasOwnProperty(drugKey)) {
				console.log("Signing off %s", drugKey);
				selectedThisSet[drugKey].done = true;
                undoable.push(drugKey);
			}

			console.log("Signed off: %O", selected);
            
            selected[state.setID] = selectedThisSet;

			this.setState({
				selected: selected,
                undoable: undoable
			});

		}.bind(this);
	},

    /*
     * Undo a sign-off action
     */
	onUndoSignOff: function(drugKey) {
		return function(event) {
			var selected = this.state.selected,
                undoable = this.state.undoable;

            /*
             * if this drug key is actually in
             * selected state Object
             */
			if(selected.hasOwnProperty(drugKey)) {
				console.log("Unsigning %s", drugKey);
				selected[drugKey].done = false;

                /*
                 * We should remove this key from the
                 * undoable array stored in state.
                 */
                var undoIndex = undoable.indexOf(drugKey)
                if(undoIndex !== -1) {
                    delete undoable[undoIndex];
                }
			}

			console.log("Undid sign off: %O", selected);

			this.setState({
				selected: selected,
                undoable: undoable
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

    /*
     *
     */
	render: function() {

		var props = this.props,
			state = this.state,
			dataKeys = Object.keys(state.data),
			renderDOM;

		console.group("  Fields.Pharmacy: render '%s'", props.name);
		    console.log("Props: %O", props);
		    console.log("State: %O", state);

        /*
         * Determine render pattern
         * based on current component "status"
         */
		switch(state.status) {

            /**
             * Component was mounted but hasn't been used.
             * Display button to initiate loading of set.
             */
			case "init":
				renderDOM = (
					<div className="btn btn-block btn-primary" onClick={this.managePrescriptionSet}>
						{'\u002b'} Load prescription set
					</div>
				);
				break;

            /**
             * Display the loading gif
             */
			case "loading":
				renderDOM = (
					<img src="/assets/img/loading.gif" />
				);
				break;

            /**
             * Display an error message
             */
            case "error":
                renderDOM = (
                    <div className="alert alert-danger">
                        <strong>An error occurred.</strong>
                        <p>{state.hasOwnProperty("message") ? state.message : "Please refresh and try again."}</p>
                    </div>
                );
                break;

            /**
             * Display the prescription set.
             */
			case "saving":
			case "view":

				var drugPicker = (
					<div className="alert alert-info">
						<strong>One moment...</strong><div>loading the latest pharmacy data</div>
					</div>
				);

				var selectedDrugs, selectedDrugsHeader, saveButton,
                    thisSetSelectedObject = state.selected[state.setID],
        			selectedKeys = Object.keys(thisSetSelectedObject);

				if(dataKeys.length > 0) {

					drugPicker = (
						<select
							className="form-control forcept-field-select-drugs"
							multiple={true}
							size={10}
							onChange={this.onSelectedDrugsChange}
                            disabled={state.status === "saving"}>

							{dataKeys.map(function(categoryKey, index) {
								var thisCategory = state.data[categoryKey];

								if(thisCategory.hasOwnProperty('settings')
									&& thisCategory.settings.hasOwnProperty('options')
									&& thisCategory.settings.options !== null) {

									var optionKeys = Object.keys(thisCategory.settings.options);

									return (
										<optgroup key={thisCategory.name} label={thisCategory.name}>
											{optionKeys.map(function(optionKey, optionIndex) {

												var thisOption = thisCategory.settings.options[optionKey],
													disabled = (thisOption.available === "false"),
													displayName = thisOption.value + (parseInt(thisOption.count) > 0 && thisOption.available ? "\u2014 " + thisOption.count : "")

												if(!disabled) {
													return (
														<option value={optionKey} key={optionIndex}>
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


					if(selectedKeys.length > 0) {
						console.log("Selected: %O", state.selected);

                        selectedDrugsHeader = (
                            <h4 className="m-t">
                                <span className="label label-success m-r">{selectedKeys.length}</span>
                                Selected / completed medications
                            </h4>
                        );

						saveButton = (
							<button type="button" className="btn btn-block btn-lg btn-success m-t" disabled={state.status === "saving"} onClick={this.savePrescriptionSet}>
								{state.status === "saving" ? "Working..." : (state.justSaved === true ? "Saved!" : "\u21ea Save prescription set")}
							</button>
						);

						selectedDrugs = selectedKeys.map(function(drugKey) {
							console.log("Selected drug key: %s", drugKey);
							console.log("...this drug's object: %O", state.drugs[drugKey]);

							var thisDrug = state.drugs[drugKey],
								thisSelection = thisSetSelectedObject[drugKey],
								signedOff = isTrue(thisSelection.done),
								preSignOffDOM,
                                undoLink;

							if(!signedOff) {
								preSignOffDOM = (
									<div className="col-xs-12">
										<div className="input-group input-group-sm">
											<span className="input-group-addon">
												Amount
											</span>
											<input
												type="number"
												min="1"
												className="form-control"
												placeholder="Enter amount here"
												defaultValue={thisSelection.amount}
												onChange={this.onDrugAmountChange(drugKey)}
                                                disabled={state.status === "saving"} />
											<span className="input-group-btn">
												<button type="button" className="btn btn-sm btn-success" onClick={this.onSignOff(drugKey)} disabled={state.status === "saving"}>
													{"\u2713"} Done
												</button>
											</span>
										</div>
									</div>
								);
							}

                            /*
                             * If this drug key is listed as undoable (it was added this stage)
                             * show the undo link
                             */
                            if(state.undoable.indexOf(drugKey) !== -1) {
                                undoLink = (
                                    <a className="btn-link" onClick={this.onUndoSignOff(drugKey)}>
                                        (undo)
                                    </a>
                                );
                            }

							return (
								<div className="row m-t">
									<div className="col-xs-12">
										<h6>
											{signedOff ? ["\u2611", thisSelection.amount, "\u00d7"].join(" ") : "\u2610"} {thisDrug.value} {undoLink}
										</h6>
									</div>
									{preSignOffDOM}
								</div>
							);
						}.bind(this));
					}

				}

				renderDOM = (
					<span>
						{drugPicker}
                        {selectedDrugsHeader}
						{selectedDrugs}
						{saveButton}
					</span>
				);

				break;
		}

		console.groupEnd();

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					{renderDOM}
				</div>
			</div>
		);

	}
});
