package co.edu.unbosque.gpcueb.horusback.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_config")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppConfig {
    @Id
    @Column(name = "config_key")
    private String configKey;

    @Column(name = "config_value")
    private String configValue;
}
