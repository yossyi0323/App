package sample;

import java.time.LocalDate;
import java.util.List;

/**
 * ユーザー情報
 */
public class User {
    private Long id;
    private String name;
    private String email;
    private Integer age;
    private LocalDate birthDate;
    private UserRole role;
    private List<Address> addresses;
    private boolean active;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public List<Address> getAddresses() { return addresses; }
    public void setAddresses(List<Address> addresses) { this.addresses = addresses; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

