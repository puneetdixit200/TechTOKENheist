/**
 * Pre-registered team seed data with permanent passwords.
 * Used by the game-actions edge function to:
 * 1. Bulk-create all 28 teams via the `seedAllTeams` action
 * 2. Preserve original passwords during `resetGame` (lookup by team name)
 */
export interface TeamSeed {
    character: string;
    leader: string;
    members: string[];
    password: string;
}

export const TEAM_SEED_DATA: TeamSeed[] = [
    { character: 'alicia',        leader: 'Nishan Kashyap',               members: ['Nishan Kashyap', 'Kushagra Jain', 'Divy Chouksey', 'Akhil Burle'],                          password: 'FgL4NKE' },
    { character: 'berlin',        leader: 'Hariom Kumar',                 members: ['Hariom Kumar', 'Sumit Kumar', 'Rishi Kumar', 'Kumar Suryansh'],                              password: 'mnWTumey' },
    { character: 'bogota',        leader: 'Suraj S Rao',                  members: ['Suraj S Rao', 'Manudev L'],                                                                  password: 'uzTVIE' },
    { character: 'clown',         leader: 'Rishi Raj',                    members: ['Rishi Raj', 'Sai Poshith'],                                                                  password: '5t5Dtks' },
    { character: 'dali',          leader: 'Ashel Blaise DSouza',          members: ['Ashel Blaise DSouza', 'Mehak', 'Mohammed Saif R', 'Harsha C'],                                password: 'S6dcfTIR' },
    { character: 'darth-nova',    leader: 'Shreemata Anant Bhat',         members: ['Shreemata Anant Bhat', 'Shravya V', 'Shravya D', 'Shravani Kulkarni'],                        password: 'VsYH8V' },
    { character: 'denver',        leader: 'V L Allen',                    members: ['V L Allen', 'Yash Nahire', 'Agniv Das', 'Abhradeep Pathra'],                                  password: '1NPWo92' },
    { character: 'enforcer',      leader: 'Prajwal R',                    members: ['Prajwal R', 'K C Suresh Naidu', 'Pruthvish S Kulkarni', 'Pranav M'],                          password: 'g93EWu9' },
    { character: 'gas',           leader: 'Sashwatth Jayaram Prasanna',   members: ['Sashwatth Jayaram Prasanna', 'Yadhavan P', 'Anirudh R', 'Trisha K S'],                        password: 'P90XJ5' },
    { character: 'hakuna',        leader: 'Jai Nitin Mayur M',            members: ['Jai Nitin Mayur M', 'Jai Nithesh Mayur M', 'Prajwal P', 'Ashwin'],                            password: '979Qbui' },
    { character: 'helsinki',      leader: 'Sheela G R',                   members: ['Sheela G R', 'Sinchana S', 'Shravya Ganiga', 'Sheethal Kaveramma I R'],                       password: 'Bfl0yFN' },
    { character: 'jessica',      leader: 'Sync',                         members: ['Sync', 'Monisha N', 'Nejiya Noushad'],                                                        password: 'MxceF4' },
    { character: 'kael',         leader: 'Abhijitha G S',                members: ['Abhijitha G S', 'Sahana R'],                                                                  password: '00sqYBK9' },
    { character: 'leon',         leader: 'Shreya Shri Pathak',           members: ['Shreya Shri Pathak', 'Shreya Shree S'],                                                       password: 'SCxe65' },
    { character: 'manila',       leader: 'Sasanuru Anirudh',             members: ['Sasanuru Anirudh', 'Raj Venkat Vijaykumar', 'Arjun Kishore'],                                 password: 'XfRv4a' },
    { character: 'marseille',    leader: 'Harshit',                      members: ['Harshit', 'Pratheeksha V'],                                                                   password: 'nTrUGF' },
    { character: 'moscow',       leader: 'Shreya Gupta',                 members: ['Shreya Gupta', 'Siyon Jain', 'Tanya Hirawat', 'Imansree Das'],                                password: 'DALegN' },
    { character: 'mystery-ace',  leader: 'Neha Pichika',                 members: ['Neha Pichika', 'Keerthi Devaraju', 'Ananya'],                                                 password: 'PWrgebK' },
    { character: 'nairobi',      leader: 'Vipul Agarwal',                members: ['Vipul Agarwal', 'Chinmay Dongre', 'Kumar Rishu', 'Vandit Meghani'],                            password: 'boP9S8q' },
    { character: 'oslo',         leader: 'S Smaran',                     members: ['S Smaran', 'Shreetam Anand', 'Saket Kumar', 'Satyam Agarwalla'],                               password: 'V1IKRiRl' },
    { character: 'palermo',      leader: 'Amith HP',                     members: ['Amith HP', 'Dhruthi Kiran', 'Keerthana M'],                                                   password: 'ggPXOZ2' },
    { character: 'raquel',       leader: 'Bhumika H G',                  members: ['Bhumika H G', 'Gagandeep Bhat', 'Harsha V Hegde'],                                            password: 'C29TVF' },
    { character: 'rio',          leader: 'Prashanth K',                  members: ['Prashanth K', 'Prashant Ramesh Hallur', 'Prajwal S Sarangamath', 'Prajwal V Joshi'],           password: 'QxqGmZf' },
    { character: 'salvador-dali', leader: 'Samhitha B A',                members: ['Samhitha B A', 'Sinchana G', 'Samanvitha', 'Deekshith S'],                                    password: 'N0QUfmC' },
    { character: 'seo-yeon',     leader: 'Vijay',                        members: ['Vijay', 'Varun R', 'Tharun Chinmay R', 'Sai Sudhanva G'],                                     password: 'wdtaz6iy' },
    { character: 'shiori',       leader: 'Navaneeth M H',                members: ['Navaneeth M H', 'Nandini M', 'Navya D'],                                                      password: 'oqisRr0Z' },
    { character: 'skull',        leader: 'Kusumitha N',                  members: ['Kusumitha N', 'Likhithashree G B', 'Poornima Musunooru'],                                     password: 'FnhXEsP' },
    { character: 'stormtrooper', leader: 'Nama Ramchand',                members: ['Nama Ramchand', 'Manish Kumar Singh', 'Jayakrishna S H'],                                     password: 'HOYLR0' },
];

/** Build a lookup map: lowercase team name → seed password */
export const buildSeedPasswordMap = (): Map<string, string> => {
    const map = new Map<string, string>();
    for (const seed of TEAM_SEED_DATA) {
        map.set(seed.character.toLowerCase(), seed.password);
    }
    return map;
};
