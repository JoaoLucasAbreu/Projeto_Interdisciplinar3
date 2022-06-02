-- Esse script vale para o MySQL 8.x. Se seu MySQL for 5.x, precisa executar essa linha comentada:
-- CREATE DATABASE IF NOT EXISTS agenda;
CREATE DATABASE IF NOT EXISTS agenda DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE agenda;

CREATE TABLE pessoa (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(50) NOT NULL,
  email varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_UN (nome)
);

-- **********************************************************************************
-- Se por acaso ocorrer algum problema de conexão, autenticação com o MySQL,
-- por favor, execute este código abaixo no MySQL e tente novamente!
--
-- ALTER USER 'USUÁRIO'@'localhost' IDENTIFIED WITH mysql_native_password BY 'SENHA';
--
-- * Assumindo que o usuário seja root e a senha root, o comando ficaria assim:
--
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
--
-- **********************************************************************************
