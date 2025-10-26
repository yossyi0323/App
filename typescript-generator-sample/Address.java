package io.quicktype;

import com.fasterxml.jackson.annotation.*;

public class Address {
    private long id;
    private String zipCode;
    private String prefecture;
    private String city;
    private String street;
    private String building;

    @JsonProperty("id")
    public long getID() { return id; }
    @JsonProperty("id")
    public void setID(long value) { this.id = value; }

    @JsonProperty("zipCode")
    public String getZipCode() { return zipCode; }
    @JsonProperty("zipCode")
    public void setZipCode(String value) { this.zipCode = value; }

    @JsonProperty("prefecture")
    public String getPrefecture() { return prefecture; }
    @JsonProperty("prefecture")
    public void setPrefecture(String value) { this.prefecture = value; }

    @JsonProperty("city")
    public String getCity() { return city; }
    @JsonProperty("city")
    public void setCity(String value) { this.city = value; }

    @JsonProperty("street")
    public String getStreet() { return street; }
    @JsonProperty("street")
    public void setStreet(String value) { this.street = value; }

    @JsonProperty("building")
    public String getBuilding() { return building; }
    @JsonProperty("building")
    public void setBuilding(String value) { this.building = value; }
}
