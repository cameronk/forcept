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
