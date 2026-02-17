class UserDTO {
  constructor({ id, fullName, email, role, twofaEnabled }) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.role = role;
    this.twofaEnabled = twofaEnabled;
  }
}

module.exports = UserDTO;
