package co.edu.unbosque.gpcueb.horusback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserMappingDTO {
    private String folderName;
    private String githubNickname;
    private String realName;
}
