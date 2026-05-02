package co.edu.unbosque.gpcueb.horusback.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hidden_contributor")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HiddenContributor {
    @Id
    @Column(name = "github_nickname")
    private String githubNickname;
}
