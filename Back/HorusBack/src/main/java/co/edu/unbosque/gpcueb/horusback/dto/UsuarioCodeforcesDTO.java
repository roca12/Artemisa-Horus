package co.edu.unbosque.gpcueb.horusback.dto;

import java.util.Objects;

public class UsuarioCodeforcesDTO {

	private String handle;

	private String firstName;

	private String lastName;

	private String country;

	private String city;

	private String organization;

	private Integer contribution;

	private String rank;

	private Integer rating;

	private String maxRank;

	private Integer maxRating;

	private Long lastOnlineTimeSeconds;

	private Long registrationTimeSeconds;

	private Integer friendOfCount;

	private String avatar;

	private String titlePhoto;

	public UsuarioCodeforcesDTO() {
		// TODO Auto-generated constructor stub
	}

	public UsuarioCodeforcesDTO(String handle, String firstName, String lastName, String country, String city,
			String organization, Integer contribution, String rank, Integer rating, String maxRank, Integer maxRating,
			Long lastOnlineTimeSeconds, Long registrationTimeSeconds, Integer friendOfCount, String avatar,
			String titlePhoto) {
		super();
		this.handle = handle;
		this.firstName = firstName;
		this.lastName = lastName;
		this.country = country;
		this.city = city;
		this.organization = organization;
		this.contribution = contribution;
		this.rank = rank;
		this.rating = rating;
		this.maxRank = maxRank;
		this.maxRating = maxRating;
		this.lastOnlineTimeSeconds = lastOnlineTimeSeconds;
		this.registrationTimeSeconds = registrationTimeSeconds;
		this.friendOfCount = friendOfCount;
		this.avatar = avatar;
		this.titlePhoto = titlePhoto;
	}

	public String getHandle() {
		return handle;
	}

	public void setHandle(String handle) {
		this.handle = handle;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getOrganization() {
		return organization;
	}

	public void setOrganization(String organization) {
		this.organization = organization;
	}

	public Integer getContribution() {
		return contribution;
	}

	public void setContribution(Integer contribution) {
		this.contribution = contribution;
	}

	public String getRank() {
		return rank;
	}

	public void setRank(String rank) {
		this.rank = rank;
	}

	public Integer getRating() {
		return rating;
	}

	public void setRating(Integer rating) {
		this.rating = rating;
	}

	public String getMaxRank() {
		return maxRank;
	}

	public void setMaxRank(String maxRank) {
		this.maxRank = maxRank;
	}

	public Integer getMaxRating() {
		return maxRating;
	}

	public void setMaxRating(Integer maxRating) {
		this.maxRating = maxRating;
	}

	public Long getLastOnlineTimeSeconds() {
		return lastOnlineTimeSeconds;
	}

	public void setLastOnlineTimeSeconds(Long lastOnlineTimeSeconds) {
		this.lastOnlineTimeSeconds = lastOnlineTimeSeconds;
	}

	public Long getRegistrationTimeSeconds() {
		return registrationTimeSeconds;
	}

	public void setRegistrationTimeSeconds(Long registrationTimeSeconds) {
		this.registrationTimeSeconds = registrationTimeSeconds;
	}

	public Integer getFriendOfCount() {
		return friendOfCount;
	}

	public void setFriendOfCount(Integer friendOfCount) {
		this.friendOfCount = friendOfCount;
	}

	public String getAvatar() {
		return avatar;
	}

	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}

	public String getTitlePhoto() {
		return titlePhoto;
	}

	public void setTitlePhoto(String titlePhoto) {
		this.titlePhoto = titlePhoto;
	}

	@Override
	public String toString() {
		return "UsuarioCodeforces [handle=" + handle + ", firstName=" + firstName + ", lastName=" + lastName
				+ ", country=" + country + ", city=" + city + ", organization=" + organization + ", contribution="
				+ contribution + ", rank=" + rank + ", rating=" + rating + ", maxRank=" + maxRank + ", maxRating="
				+ maxRating + ", lastOnlineTimeSeconds=" + lastOnlineTimeSeconds + ", registrationTimeSeconds="
				+ registrationTimeSeconds + ", friendOfCount=" + friendOfCount + ", avatar=" + avatar + ", titlePhoto="
				+ titlePhoto + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(avatar, city, contribution, country, firstName, friendOfCount, handle, lastName,
				lastOnlineTimeSeconds, maxRank, maxRating, organization, rank, rating, registrationTimeSeconds,
				titlePhoto);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		UsuarioCodeforcesDTO other = (UsuarioCodeforcesDTO) obj;
		return Objects.equals(avatar, other.avatar) && Objects.equals(city, other.city)
				&& Objects.equals(contribution, other.contribution) && Objects.equals(country, other.country)
				&& Objects.equals(firstName, other.firstName) && Objects.equals(friendOfCount, other.friendOfCount)
				&& Objects.equals(handle, other.handle) && Objects.equals(lastName, other.lastName)
				&& Objects.equals(lastOnlineTimeSeconds, other.lastOnlineTimeSeconds)
				&& Objects.equals(maxRank, other.maxRank) && Objects.equals(maxRating, other.maxRating)
				&& Objects.equals(organization, other.organization) && Objects.equals(rank, other.rank)
				&& Objects.equals(rating, other.rating)
				&& Objects.equals(registrationTimeSeconds, other.registrationTimeSeconds)
				&& Objects.equals(titlePhoto, other.titlePhoto);
	}

}
