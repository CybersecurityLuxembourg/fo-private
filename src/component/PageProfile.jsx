import React from "react";
import "./PageProfile.css";
import { NotificationManager as nm } from "react-notifications";
import _ from "lodash";
import Loading from "./box/Loading.jsx";
import Info from "./box/Info.jsx";
import FormLine from "./form/FormLine.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import { validatePassword } from "../utils/re.jsx";

export default class PageProfile extends React.Component {
	constructor(props) {
		super(props);

		this.refreshUser = this.refreshUser.bind(this);
		this.changePassword = this.changePassword.bind(this);

		this.state = {
			user: null,
			password: null,
			newPassword: null,
			newPasswordConfirmation: null,
		};
	}

	componentDidMount() {
		this.refreshUser();
	}

	refreshUser() {
		this.setState({
			user: null,
		});

		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	saveUser() {
		const params = {
			telephone: this.state.user.telephone,
			first_name: this.state.user.first_name,
			last_name: this.state.user.last_name,
		};

		postRequest.call(this, "private/update_my_user", params, () => {
			this.setState({
				hasModification: false,
			});
			nm.info("The information has been saved");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeUser(field, value) {
		const user = _.cloneDeep(this.state.user);
		user[field] = value;
		this.setState({
			user,
			hasModification: true,
		});
	}

	changePassword() {
		const params = {
			password: this.state.password,
			new_password: this.state.newPassword,
		};

		postRequest.call(this, "account/change_password", params, () => {
			this.setState({
				password: null,
				newPassword: null,
				newPasswordConfirmation: null,
			});
			nm.info("The password has been changed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div className={"page max-sized-page"}>
				<div className={"row"}>
					<div className="col-md-12">
						<h1>My profile</h1>

						<div className="top-right-buttons">
							<button
								onClick={() => this.refreshUser()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>My information</h2>

						{this.state.user !== null
							? <div className="col-md-12">
								<FormLine
									label={"Email"}
									value={this.state.user.email}
									disabled={true}
								/>
								<FormLine
									label={"First name"}
									value={this.state.user.first_name}
									onChange={(v) => this.changeUser("first_name", v)}
								/>
								<FormLine
									label={"Last name"}
									value={this.state.user.last_name}
									onChange={(v) => this.changeUser("last_name", v)}
								/>
								<FormLine
									label={"Phone"}
									type={"phone"}
									value={this.state.user.telephone}
									onChange={(v) => this.changeUser("telephone", v)}
								/>
								<div className="right-buttons">
									<button
										onClick={() => this.saveUser()}
										disabled={!this.state.hasModification}>
										<i className="far fa-save"/> Save
									</button>
								</div>
							</div>
							: <Loading
								height={300}
							/>
						}
					</div>
				</div>
				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<h2>Change password</h2>
						{this.state.user !== null
							? <div>
								<FormLine
									label={"Current password"}
									value={this.state.password}
									onChange={(v) => this.changeState("password", v)}
									format={validatePassword}
									type={"password"}
								/>
								<Info
									content={
										<div>
											The password must:<br/>
											<li>contain at least 1 lowercase alphabetical character</li>
											<li>contain at least 1 uppercase alphabetical character</li>
											<li>contain at least 1 numeric character</li>
											<li>contain at least 1 special character such as !@#$%^&*</li>
											<li>be between 8 and 30 characters long</li>
										</div>
									}
								/>
								<FormLine
									label={"New password"}
									value={this.state.newPassword}
									onChange={(v) => this.changeState("newPassword", v)}
									format={validatePassword}
									type={"password"}
								/>
								<FormLine
									label={"New password confirmation"}
									value={this.state.newPasswordConfirmation}
									onChange={(v) => this.changeState("newPasswordConfirmation", v)}
									format={validatePassword}
									type={"password"}
								/>
								<div className="right-buttons">
									<button
										onClick={() => this.changePassword()}
										disabled={!validatePassword(this.state.password)
											|| !validatePassword(this.state.newPassword)
											|| !validatePassword(this.state.newPasswordConfirmation)
											|| this.state.newPassword !== this.state.newPasswordConfirmation}>
										<i className="far fa-save"/> Change password
									</button>
								</div>
							</div>
							: <Loading
								height={150}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}