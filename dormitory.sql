-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema dormitory
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema dormitory
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `dormitory` DEFAULT CHARACTER SET utf8 ;
USE `dormitory` ;

-- -----------------------------------------------------
-- Table `dormitory`.`account`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dormitory`.`account` (
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`username`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `dormitory`.`admin`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dormitory`.`admin` (
  `name` VARCHAR(45) NOT NULL DEFAULT 'No name',
  `account_username` VARCHAR(45) NOT NULL,
  `building_num` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`account_username`),
  CONSTRAINT `fk_admin_account1`
    FOREIGN KEY (`account_username`)
    REFERENCES `dormitory`.`account` (`username`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `dormitory`.`dorm`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dormitory`.`dorm` (
  `room_num` INT(11) NOT NULL,
  `capacity` INT(11) NULL DEFAULT NULL,
  `building_num` INT(11) NOT NULL,
  `admin_account_username` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`room_num`, `building_num`),
  INDEX `fk_dorm_admin1_idx` (`admin_account_username` ASC),
  CONSTRAINT `fk_dorm_admin1`
    FOREIGN KEY (`admin_account_username`)
    REFERENCES `dormitory`.`admin` (`account_username`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `dormitory`.`student`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dormitory`.`student` (
  `name` VARCHAR(45) NOT NULL DEFAULT 'No name',
  `class` VARCHAR(45) NULL DEFAULT NULL,
  `college` VARCHAR(45) NULL DEFAULT NULL,
  `id` INT(11) NULL DEFAULT NULL,
  `account_username` VARCHAR(45) NOT NULL,
  `dorm_room_num` INT(11) NULL DEFAULT NULL,
  `dorm_building_num` INT(11) NULL DEFAULT NULL,
  `bed_num` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`account_username`),
  INDEX `fk_student_dorm1_idx` (`dorm_room_num` ASC, `dorm_building_num` ASC),
  CONSTRAINT `fk_student_dorm1`
    FOREIGN KEY (`dorm_room_num` , `dorm_building_num`)
    REFERENCES `dormitory`.`dorm` (`room_num` , `building_num`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_students_account1`
    FOREIGN KEY (`account_username`)
    REFERENCES `dormitory`.`account` (`username`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `dormitory`.`applyment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dormitory`.`applyment` (
  `type` VARCHAR(45) NULL DEFAULT NULL,
  `destination` INT(11) NULL DEFAULT NULL,
  `state` VARCHAR(45) NULL DEFAULT NULL,
  `student_account_username` VARCHAR(45) NOT NULL,
  `id` INT(11) NOT NULL,
  PRIMARY KEY (`student_account_username`, `id`),
  INDEX `fk_applyment_students1_idx` (`student_account_username` ASC),
  CONSTRAINT `fk_applyment_students1`
    FOREIGN KEY (`student_account_username`)
    REFERENCES `dormitory`.`student` (`account_username`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `dormitory`.`discipline`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dormitory`.`discipline` (
  `content` VARCHAR(200) NOT NULL DEFAULT 'NULL',
  `student_account_username` VARCHAR(45) NOT NULL,
  `date` VARCHAR(45) NULL DEFAULT NULL,
  `id` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`student_account_username`),
  INDEX `fk_displine_students1_idx` (`student_account_username` ASC),
  CONSTRAINT `fk_displine_students1`
    FOREIGN KEY (`student_account_username`)
    REFERENCES `dormitory`.`student` (`account_username`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `dormitory`.`equipment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dormitory`.`equipment` (
  `id` INT(11) NOT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `time` VARCHAR(45) NULL DEFAULT NULL,
  `state` VARCHAR(45) NULL DEFAULT NULL,
  `dorm_room_num` INT(11) NULL DEFAULT NULL,
  `dorm_building_num` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_equipment_dorm1_idx` (`dorm_room_num` ASC, `dorm_building_num` ASC),
  CONSTRAINT `fk_equipment_dorm1`
    FOREIGN KEY (`dorm_room_num` , `dorm_building_num`)
    REFERENCES `dormitory`.`dorm` (`room_num` , `building_num`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `dormitory`.`fix`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dormitory`.`fix` (
  `feedback` VARCHAR(45) NULL DEFAULT NULL,
  `state` VARCHAR(45) NULL DEFAULT NULL,
  `equipment_id` INT(11) NOT NULL,
  `date` VARCHAR(45) NULL DEFAULT NULL,
  `id` INT(11) NOT NULL,
  PRIMARY KEY (`equipment_id`, `id`),
  INDEX `fk_fix_equipment1_idx` (`equipment_id` ASC),
  CONSTRAINT `fk_fix_equipment1`
    FOREIGN KEY (`equipment_id`)
    REFERENCES `dormitory`.`equipment` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `dormitory`.`instructor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dormitory`.`instructor` (
  `name` VARCHAR(45) NOT NULL DEFAULT 'No name',
  `class` VARCHAR(45) NULL DEFAULT NULL,
  `account_username` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`account_username`),
  CONSTRAINT `fk_instructor_account1`
    FOREIGN KEY (`account_username`)
    REFERENCES `dormitory`.`account` (`username`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
