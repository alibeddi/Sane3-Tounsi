-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 26 mars 2025 à 03:16
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `tn_m3allim`
--

-- --------------------------------------------------------

--
-- Structure de la table `artisans`
--

CREATE TABLE `artisans` (
  `id` int(11) NOT NULL,
  `spécialité` varchar(150) NOT NULL,
  `localisation` varchar(255) NOT NULL,
  `expérience` int(11) DEFAULT NULL CHECK (`expérience` >= 0),
  `utilisateur_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `avis`
--

CREATE TABLE `avis` (
  `id` int(11) NOT NULL,
  `note` tinyint(4) NOT NULL CHECK (`note` between 1 and 5),
  `commentaire` text NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `artisan_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `enquete`
--

CREATE TABLE `enquete` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `num_tel` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `enquete`
--

INSERT INTO `enquete` (`id`, `nom`, `email`, `num_tel`, `message`, `created_at`) VALUES
(1, 'jawher', 'jawher@gmail.com', '24246408', 'bon travaill', '2025-02-23 18:34:58'),
(2, 'mahdi', 'mahdi@gmail.com', '24246409', 'bon travailll', '2025-02-25 13:11:58'),
(3, 'amine', 'amine@gmail.com', '52666999', 'holà amigo', '2025-02-25 17:23:18'),
(4, 'maram ', 'maram@gmail.com', '2424608', 'bo, travail', '2025-02-26 13:07:32'),
(5, 'mourad12', 'mourad@gmail.com', '+21624357565', 'اريد الابلاغ عن مشكل', '2025-03-22 15:35:13'),
(6, 'محمد الخضر', 'mouhamed@gmail.com', '+21624357565', 'mouvise reponse ', '2025-03-22 15:49:09'),
(7, 'dhhia', 'dhiabejaoui@gmail.com', '+21624357565', 'c\'est ne pas travail les site ', '2025-03-24 09:59:55');

-- --------------------------------------------------------

--
-- Structure de la table `réservations`
--

CREATE TABLE `réservations` (
  `id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `artisan_id` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `statut` enum('en attente','confirmée','annulée','terminée') DEFAULT 'en attente',
  `service_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `titre` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `prix` decimal(10,2) NOT NULL CHECK (`prix` >= 0),
  `artisan_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users_info`
--

CREATE TABLE `users_info` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `age` int(11) NOT NULL,
  `account_type` enum('worker') NOT NULL,
  `profile_photo` longblob DEFAULT NULL,
  `photo_extension` varchar(10) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `contact_whatsapp` varchar(20) DEFAULT NULL,
  `contact_facebook` varchar(255) DEFAULT NULL,
  `country` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `craft_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users_info`
--

INSERT INTO `users_info` (`id`, `username`, `password`, `fullname`, `gender`, `age`, `account_type`, `profile_photo`, `photo_extension`, `contact_phone`, `contact_whatsapp`, `contact_facebook`, `country`, `state`, `city`, `craft_type`, `created_at`) VALUES
(1, 'nizar', 'mypassword123', 'Nizar Maedessi', 'male', 22, 'worker', 0x70726f66696c655f70686f746f2e6a7067, 'jpg', '123456789', '987654321', 'nizar_facebook', 'Tunisia', 'Tunis', 'Manouba', 'developer', '2025-03-01 16:37:42'),
(2, 'نزار', 'mypassword123', 'نزار مايدي', '', 22, '', 0x70726f66696c655f70686f746f2e6a7067, 'jpg', '123456789', '987654321', 'nizar_facebook', 'تونس', 'تونس', 'منوبة', 'مطور', '2025-03-01 16:39:15');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `rôle` enum('client','artisan','admin') NOT NULL,
  `utilisateur_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `email`, `mot_de_passe`, `rôle`, `utilisateur_id`) VALUES
(9, 'jawher', 'jawher1@gmail.com', '$2b$10$WvQabzfHI.iYvcuvHvqrp.QO45JJWKUJgmO4P4qLm9oFdIess.Hqu', 'client', NULL),
(10, 'amine', 'amine@gmail.com', '$2b$10$XwgF3Qw.x.7JHBtgxVzWWeKHG/kT/2ZcCzMalkbQjpSW96tduB12G', 'artisan', NULL),
(11, 'mahdi', 'mahdi@gmail.com', '$2b$10$XwgF3Qw.x.7JHBtgxVzWWeKHG/kT/2ZcCzMalkbQjpSW96tduB12G', 'admin', NULL),
(12, 'achref', 'achref@gmail.com', '$2b$10$1TnMSUCotemzygLZXBpsd.j135yQpdR28bKJCUjX7vCNvnd8fM37a', 'artisan', NULL),
(13, 'ahmed', 'ahmed@gmail.com', '$2b$10$enOWZIPfmnivQGMUQR9nDe9md.yavlooLuzsSA/9.kIUeve3hhdMS', 'client', NULL),
(17, 'mahdi', 'mahdibarka@gmail.com', '$2b$10$rwLKhbB99phMDTBzzsDe2umDPPRFsPPZc.yH2fuUHkP.AL56fOeEW', 'client', NULL),
(19, 'salah', 'salahderidi@gmail.com', '$2b$10$Vptm2sr8MzZXGfsXPcaEY..fDTe7LH.31HLZROcg6OF9bPuRQaJYS', 'client', NULL),
(20, 'khaled', 'khaled@gmail.com', '$2b$10$BckEUYoh6SnUyL7lZTcRquQmpXahC.4LcP9/0iY4wxrY7CqdhWr.O', 'artisan', NULL),
(21, 'salah', 'salah@gmail.com', '$2b$10$IA6zAfKoZiCEMudi9utJAupHYB9PRELNPEL/71YibHl2o3cO5iiga', 'client', NULL),
(22, 'fathi', 'fathi@gmilcom', '$2b$10$2OVeKwTtH/OUaFomRbbtM.J7Lb5Xg3.WN/6MKII9rhIXkWJQzTBuO', 'artisan', NULL),
(23, 'mahdi', 'mahdibarka29@gmzil.com', '$2b$10$Y2hFK7mhZ3luLBKrkkTKdepvX.fxMqScInNFZeNnyraYH9dwqAFB.', 'client', NULL),
(24, 'tayeb', 'tayeb@gmail.com', '$2b$10$bWtXSiJYtLx5x8mix0hIpOP9Yr61KX1XizZ8XTxOhdprCP/dKQUru', 'artisan', NULL),
(25, 'salah', 'salah123@gmail.com', '$2b$10$nk07m8wS6PgvSJKx1UnwQ.aqBmfNdSrhkEjqoFh3aSK0rsX2bcvcO', 'client', NULL),
(26, 'salah', 'salah1234@gmail.com', '$2b$10$OTDVf3eplEoAP93oD0h82eWSZzRfba08QhNQGdZyeV9hzqeQZ4mIa', 'client', NULL),
(27, 'tebai', 'tebai.s@gmail.com', '$2b$10$pFKOu1Rb8x6ecK1gX5GAWeIeAKCvUS1Twib1pli82d47rPg.WefnS', 'client', NULL),
(28, 'oussama', 'oussama@gmail.com', '$2b$10$E7Q4Ngco.XEFIwBfQ.LZIuisKKQGptyuwIl7rWXQYsvn1Zqm8iEju', 'artisan', NULL),
(29, 'arej', 'arej123@gmail.com', '$2b$10$bHCES4CXzfaibo6CWzlqa.EMNhd0g7nrciJWv7bwgcNmaJW68NTte', 'client', NULL),
(30, 'mourad', 'mourad@gmail.com', '$2b$10$QpBCIG/E.zAlMUS7Ph8HBOxbZAn6L3sgS25elFl2xdigvNSs/ylw6', 'artisan', NULL),
(31, 'salah_br', 'fathi123@gmail.com', '$2b$10$wt4R4ikKk8iH3SNfK8KmxemadWcIJOPATRbnKMy7BXX7brZJorfWG', 'artisan', NULL),
(32, 'mourad', 'mourad12@gmail.com', '$2b$10$bJRgobTKSZ00A4L8UTdq/.5CKRnaBB1HXofdyHNT0mg8QHdI.Y5Vy', 'client', NULL),
(33, 'mohamed_jawher', 'mohamedjawherg@gmail.com', '$2b$10$XTfThIrDwtxI3qCFtyr4aOfjv4RlM5SZHhj6E3qTePjhp3d2tjyiW', 'client', NULL),
(34, 'mahdi', 'mahdibarka29@gmail.com', '$2b$10$xTQYUs5b1NeoIAqsX3XlfO5N6Webh9pW83RN4ZRAbe3WeX5zVP7L6', 'client', NULL),
(35, 'khlaed', 'khaleed@gmail.com', '$2b$10$BqzR4FzZBNGDjweXygHS3.mwYF4LNoiSqbFKCXdMGHZ9u02aNRORa', 'artisan', NULL),
(39, '', 'salah123]gmail.com', '$2b$10$jqNSPxkcQIhb2HegIVoPOuxB6zgvi7lMXLSqrTRrCkftTeJrhuw5C', 'admin', NULL),
(42, 'salah_bn', 'salah1@gmail.com', '$2b$10$49/JVBIaChrN0OcYVN8wPuc6TWLlEJgxm7IwDep.Y4/3jKpKPAy5a', 'admin', NULL),
(44, 'slah', 'khaled123@gmail.com', '$2b$10$r1ToaalLZqMKpLWLW6VlT.OMn7jDwKsinBWsH9TCtAlE4xmzxMoR6', 'client', NULL),
(45, 'taher', 'taher@gmail.com', '$2b$10$miHMJvKJFqFMUlJRNNq7iuoeijdZkr8jOXbczhsbOAzewo7sm.XxK', 'artisan', NULL),
(46, 'meftah', 'meftah@gmail.com', '$2b$10$V1vNXY39dhlqXPSzhk11kO3ZM6a2IVTz.UMQfJHsjBx6Yu186ABki', 'client', NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `artisans`
--
ALTER TABLE `artisans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`);

--
-- Index pour la table `avis`
--
ALTER TABLE `avis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`),
  ADD KEY `artisan_id` (`artisan_id`);

--
-- Index pour la table `enquete`
--
ALTER TABLE `enquete`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `réservations`
--
ALTER TABLE `réservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`),
  ADD KEY `artisan_id` (`artisan_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Index pour la table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `artisan_id` (`artisan_id`);

--
-- Index pour la table `users_info`
--
ALTER TABLE `users_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `utilisateur_id` (`utilisateur_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `artisans`
--
ALTER TABLE `artisans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `avis`
--
ALTER TABLE `avis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `enquete`
--
ALTER TABLE `enquete`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `réservations`
--
ALTER TABLE `réservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users_info`
--
ALTER TABLE `users_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `artisans`
--
ALTER TABLE `artisans`
  ADD CONSTRAINT `artisans_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `avis`
--
ALTER TABLE `avis`
  ADD CONSTRAINT `avis_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `avis_ibfk_2` FOREIGN KEY (`artisan_id`) REFERENCES `artisans` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `réservations`
--
ALTER TABLE `réservations`
  ADD CONSTRAINT `réservations_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `réservations_ibfk_2` FOREIGN KEY (`artisan_id`) REFERENCES `artisans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `réservations_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`artisan_id`) REFERENCES `artisans` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
