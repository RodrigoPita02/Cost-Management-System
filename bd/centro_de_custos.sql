CREATE DATABASE  IF NOT EXISTS `centro_de_custos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `centro_de_custos`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: centro_de_custos
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `custo`
--

DROP TABLE IF EXISTS `custo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data` date DEFAULT NULL,
  `tipo` enum('Banco','Funcionarios','Fornecedores','Servicos','Estado') NOT NULL,
  `descricao_id` int NOT NULL,
  `valor` decimal(10,2) DEFAULT NULL,
  `tipo_pagamento_id` int DEFAULT NULL,
  `situacao_id` int DEFAULT NULL,
  `data_pagamento` date DEFAULT NULL,
  `pdf_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `descricao_id` (`descricao_id`),
  KEY `tipo_pagamento_id` (`tipo_pagamento_id`),
  KEY `situacao_id` (`situacao_id`),
  CONSTRAINT `custo_ibfk_1` FOREIGN KEY (`descricao_id`) REFERENCES `descricao` (`id`),
  CONSTRAINT `custo_ibfk_2` FOREIGN KEY (`tipo_pagamento_id`) REFERENCES `tipopagamento` (`id`),
  CONSTRAINT `custo_ibfk_3` FOREIGN KEY (`situacao_id`) REFERENCES `situacao` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custo`
--

LOCK TABLES `custo` WRITE;
/*!40000 ALTER TABLE `custo` DISABLE KEYS */;
INSERT INTO `custo` VALUES (50,'2024-10-22','Estado',50,50.00,1,2,'2024-10-22',NULL),(51,'2024-11-01','Banco',1,100.00,2,1,'2024-11-01','51_2024-10-22.pdf'),(52,'2024-10-22','Servicos',38,200.00,3,1,'2024-10-22','testepdf.pdf'),(53,'2024-10-29','Funcionarios',8,500.00,3,1,'2024-11-09','6.pdf');
/*!40000 ALTER TABLE `custo` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_custo` AFTER INSERT ON `custo` FOR EACH ROW BEGIN
    INSERT INTO custosecundario (data, descricao, valor, data_pagamento, pdf_path)
    VALUES (NEW.data, (SELECT nome FROM descricao WHERE id = NEW.descricao_id), NEW.valor, NEW.data_pagamento, NEW.pdf_path)
    ON DUPLICATE KEY UPDATE
    data = VALUES(data),
    descricao = VALUES(descricao),
    valor = VALUES(valor),
    data_pagamento = VALUES(data_pagamento),
    pdf_path = VALUES(pdf_path);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_custo_pdf_update` AFTER INSERT ON `custo` FOR EACH ROW BEGIN
    UPDATE custosecundario cs
    JOIN descricao d ON d.id = NEW.descricao_id
    SET cs.pdf_path = NEW.pdf_path
    WHERE cs.data = NEW.data
      AND cs.descricao = d.nome
      AND cs.valor = NEW.valor
      AND cs.data_pagamento = NEW.data_pagamento;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_update_custo` AFTER UPDATE ON `custo` FOR EACH ROW BEGIN
    IF OLD.pdf_path <> NEW.pdf_path THEN
        INSERT INTO custosecundario (data, descricao, valor, data_pagamento, pdf_path)
        VALUES (NEW.data, (SELECT nome FROM descricao WHERE id = NEW.descricao_id), NEW.valor, NEW.data_pagamento, NEW.pdf_path)
        ON DUPLICATE KEY UPDATE
        data = VALUES(data),
        descricao = VALUES(descricao),
        valor = VALUES(valor),
        data_pagamento = VALUES(data_pagamento),
        pdf_path = VALUES(pdf_path);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_update_custo_pdf_update` AFTER UPDATE ON `custo` FOR EACH ROW BEGIN
    UPDATE custosecundario cs
    JOIN descricao d ON d.id = NEW.descricao_id
    SET cs.pdf_path = NEW.pdf_path
    WHERE cs.data = NEW.data
      AND cs.descricao = d.nome
      AND cs.valor = NEW.valor
      AND cs.data_pagamento = NEW.data_pagamento;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_delete_custo` AFTER DELETE ON `custo` FOR EACH ROW BEGIN
    DELETE FROM custosecundario
    WHERE data = OLD.data
      AND descricao = (SELECT nome FROM descricao WHERE id = OLD.descricao_id)
      AND valor = OLD.valor
      AND data_pagamento = OLD.data_pagamento;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `custosecundario`
--

DROP TABLE IF EXISTS `custosecundario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custosecundario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data` date NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `pdf_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custosecundario`
--

LOCK TABLES `custosecundario` WRITE;
/*!40000 ALTER TABLE `custosecundario` DISABLE KEYS */;
INSERT INTO `custosecundario` VALUES (25,'2024-10-08','Combustivel',30.00,'2024-10-08','CV_testepdf.pdf'),(32,'2024-10-22','A.T - Retenção na fonte',50.00,'2024-10-22',NULL),(33,'2024-11-01','CGD',100.00,'2024-11-01','51_2024-10-22.pdf'),(34,'2024-10-22','Almas Industrias',200.00,'2024-10-22','testepdf.pdf'),(35,'2024-10-21','Repsol',30.00,'2024-10-21',NULL),(36,'2024-10-29','Rita Gaspar',500.00,'2024-11-09','6.pdf'),(37,'2024-10-29','Roupa de Criança',15.00,'2024-10-29',NULL);
/*!40000 ALTER TABLE `custosecundario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custovariavel`
--

DROP TABLE IF EXISTS `custovariavel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custovariavel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data` date NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `tipo_pagamento_id` int DEFAULT NULL,
  `situacao_id` int DEFAULT NULL,
  `data_pagamento` date DEFAULT NULL,
  `pdf_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tipo_pagamento_id` (`tipo_pagamento_id`),
  KEY `situacao_id` (`situacao_id`),
  CONSTRAINT `custovariavel_ibfk_1` FOREIGN KEY (`tipo_pagamento_id`) REFERENCES `tipopagamento` (`id`),
  CONSTRAINT `custovariavel_ibfk_2` FOREIGN KEY (`situacao_id`) REFERENCES `situacao` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custovariavel`
--

LOCK TABLES `custovariavel` WRITE;
/*!40000 ALTER TABLE `custovariavel` DISABLE KEYS */;
INSERT INTO `custovariavel` VALUES (11,'2024-10-08','Combustivel',30.00,2,1,'2024-10-08','CV_testepdf.pdf'),(13,'2024-10-21','Repsol',30.00,2,1,'2024-10-21',NULL),(14,'2024-10-29','Roupa de Criança',15.00,2,1,'2024-10-29',NULL);
/*!40000 ALTER TABLE `custovariavel` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_custovariavel` AFTER INSERT ON `custovariavel` FOR EACH ROW BEGIN
    INSERT INTO custosecundario (data, descricao, valor, data_pagamento, pdf_path)
    VALUES (NEW.data, NEW.descricao, NEW.valor, NEW.data_pagamento, NEW.pdf_path)
    ON DUPLICATE KEY UPDATE
    data = VALUES(data),
    descricao = VALUES(descricao),
    valor = VALUES(valor),
    data_pagamento = VALUES(data_pagamento),
    pdf_path = VALUES(pdf_path);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_insert_custovariavel_pdf_update` AFTER INSERT ON `custovariavel` FOR EACH ROW BEGIN
    UPDATE custosecundario cs
    SET cs.pdf_path = NEW.pdf_path
    WHERE cs.data = NEW.data
      AND cs.descricao = NEW.descricao
      AND cs.valor = NEW.valor
      AND cs.data_pagamento = NEW.data_pagamento;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_update_custovariavel` AFTER UPDATE ON `custovariavel` FOR EACH ROW BEGIN
    IF OLD.pdf_path <> NEW.pdf_path THEN
        INSERT INTO custosecundario (data, descricao, valor, data_pagamento, pdf_path)
        VALUES (NEW.data, NEW.descricao, NEW.valor, NEW.data_pagamento, NEW.pdf_path)
        ON DUPLICATE KEY UPDATE
        data = VALUES(data),
        descricao = VALUES(descricao),
        valor = VALUES(valor),
        data_pagamento = VALUES(data_pagamento),
        pdf_path = VALUES(pdf_path);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_update_custovariavel_pdf_update` AFTER UPDATE ON `custovariavel` FOR EACH ROW BEGIN
    UPDATE custosecundario cs
    SET cs.pdf_path = NEW.pdf_path
    WHERE cs.data = NEW.data
      AND cs.descricao = NEW.descricao
      AND cs.valor = NEW.valor
      AND cs.data_pagamento = NEW.data_pagamento;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_delete_custovariavel` AFTER DELETE ON `custovariavel` FOR EACH ROW BEGIN
    DELETE FROM custosecundario
    WHERE data = OLD.data
      AND descricao = OLD.descricao
      AND valor = OLD.valor
      AND data_pagamento = OLD.data_pagamento;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `descricao`
--

DROP TABLE IF EXISTS `descricao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `descricao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('Banco','Funcionarios','Fornecedores','Servicos','Estado') NOT NULL,
  `nome` varchar(255) NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descricao`
--

LOCK TABLES `descricao` WRITE;
/*!40000 ALTER TABLE `descricao` DISABLE KEYS */;
INSERT INTO `descricao` VALUES (1,'Banco','CGD',1),(2,'Banco','PRIMUS',1),(3,'Banco','BPI',1),(4,'Funcionarios','Lucia Silva',1),(5,'Funcionarios','David Martinho',1),(6,'Funcionarios','Carla Pimenta',1),(7,'Funcionarios','Sonia Campos',1),(8,'Funcionarios','Rita Gaspar',1),(9,'Funcionarios','Margarida Nunes',1),(10,'Funcionarios','Neuza Torres',1),(11,'Funcionarios','Daniela Teixeira',1),(12,'Funcionarios','Gertrudes Peitinho',1),(13,'Funcionarios','Ana Carolina',1),(14,'Funcionarios','Mónica',1),(15,'Funcionarios','Dora Simao',1),(16,'Funcionarios','Beatriz S',1),(17,'Funcionarios','Claudia Oliveira',1),(18,'Fornecedores','Recheio',1),(19,'Fornecedores','Mercadona',1),(20,'Fornecedores','Intermache',1),(21,'Fornecedores','Talho Ant. Cacete',1),(22,'Fornecedores','Hygistar',1),(23,'Fornecedores','Frijobel',1),(24,'Fornecedores','Rf e Cr',1),(25,'Fornecedores','FMH',1),(26,'Fornecedores','A. V. Roldao',1),(27,'Fornecedores','Delta',1),(28,'Fornecedores','MGC',1),(29,'Fornecedores','Farm. Tavares de Matos',1),(30,'Servicos','Mapfre',1),(31,'Servicos','Fidelidade',1),(32,'Servicos','Vodafone',1),(33,'Servicos','Iberdrola',1),(34,'Servicos','CMP',1),(35,'Servicos','Miguel Oliveira',1),(36,'Servicos','Via Verde',1),(37,'Servicos','Ticket',1),(38,'Servicos','Almas Industrias',1),(39,'Servicos','Radius',1),(40,'Servicos','Disporsado',1),(49,'Estado','Seg.Social',1),(50,'Estado','A.T - Retenção na fonte',1),(51,'Estado','A.T - IRS',1),(52,'Estado','A.T - IRC',1),(53,'Estado','A.T - Pagamento por conta',1);
/*!40000 ALTER TABLE `descricao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `situacao`
--

DROP TABLE IF EXISTS `situacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `situacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descricao` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `situacao`
--

LOCK TABLES `situacao` WRITE;
/*!40000 ALTER TABLE `situacao` DISABLE KEYS */;
INSERT INTO `situacao` VALUES (1,'Pago'),(2,'Por pagar');
/*!40000 ALTER TABLE `situacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipopagamento`
--

DROP TABLE IF EXISTS `tipopagamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipopagamento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descricao` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipopagamento`
--

LOCK TABLES `tipopagamento` WRITE;
/*!40000 ALTER TABLE `tipopagamento` DISABLE KEYS */;
INSERT INTO `tipopagamento` VALUES (1,'MB'),(2,'Numerario'),(3,'Transferencia');
/*!40000 ALTER TABLE `tipopagamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'centro_de_custos'
--

--
-- Dumping routines for database 'centro_de_custos'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-25 13:52:14
