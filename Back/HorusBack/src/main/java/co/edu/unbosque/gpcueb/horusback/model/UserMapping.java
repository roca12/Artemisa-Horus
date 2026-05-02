package co.edu.unbosque.gpcueb.horusback.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_mapping")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserMapping {
    @Id
    @Column(name = "folder_name")
    private String folderName;

    @Column(name = "github_nickname")
    private String githubNickname;

    @Column(name = "real_name")
    private String realName;
}
