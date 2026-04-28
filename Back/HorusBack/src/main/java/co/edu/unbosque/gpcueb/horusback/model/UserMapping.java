package co.edu.unbosque.gpcueb.horusback.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserMapping {
    @Id
    private String githubNickname;
    private String realName;
}
