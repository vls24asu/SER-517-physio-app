class UserDTO {
  constructor({ id, fullName, email, role, twofaEnabled, twofaSecret, onboarding_completed }) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.role = role;
    this.twofaEnabled = twofaEnabled;
    this.twofaSecret = twofaSecret;
    this.onboarding_completed = onboarding_completed;
  }
}

module.exports = UserDTO;
