import { useEffect, useState, useCallback, useMemo } from "react";
import { Text, View, StyleSheet, SectionList, Alert, Image, Pressable } from "react-native";
import { Searchbar } from "react-native-paper";
import debounce from "lodash.debounce";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

const BASE_URL = "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json";

const categoryData = {
  "saude": {
    "imagem": "https://zellosaude.app/wp-content/uploads/2021/05/zello_saudedoenca.png",
    "descricao": "Explore recursos e informações sobre saúde, com acesso a conteúdos relevantes e atualizados para o seu bem-estar."
  },
  "cultura": {
    "imagem": "https://arteemcurso.com/wp-content/uploads/2018/09/233552-mapa-da-cultura-conheca-a-plataforma-lancada-pelo-governo-federal-1024x683.png",
    "descricao": "Descubra a rica cultura brasileira através de uma variedade de plataformas e iniciativas que promovem a arte e o conhecimento cultural."
  },
  "comidas": {
    "imagem": "https://static.itdg.com.br/images/1200-630/2c4abf585e392b0ff817bd3d0cf4f329/cidades-com-comida-brasileira.jpg",
    "descricao": "Conheça a diversidade culinária do Brasil, com pratos típicos e receitas que representam a rica tradição gastronômica do país."
  },
  "direitos": {
    "imagem": "https://sinbraf.com.br/wp-content/uploads/2023/12/Direitos-Humanos.png",
    "descricao": "Informações e recursos sobre direitos humanos e cidadania, promovendo a igualdade e a justiça social para todos."
  }
};

const Item = ({ name, description, image }) => (
  <View style={styles.item}>
    <Image style={styles.itemImage} source={{ uri: image }} />
    <View style={styles.itemBody}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </View>
);

export const Home = ({ navigation }) => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    orderStatuses: false,
    passwordChanges: false,
    specialOffers: false,
    newsletter: false,
    image: "",
  });
  const [data, setData] = useState([]);
  const [searchBarText, setSearchBarText] = useState("");
  const [query, setQuery] = useState("");
  const [filterSelections, setFilterSelections] = useState([]);

  const fetchData = async () => {
    // Mocking data fetch as JSON is static
    return Object.keys(categoryData).map(key => ({
      title: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the section title
      data: [{
        name: key.charAt(0).toUpperCase() + key.slice(1),
        description: categoryData[key].descricao,
        image: categoryData[key].imagem,
      }]
    }));
  };

  useEffect(() => {
    (async () => {
      try {
        const sectionListData = await fetchData();
        setData(sectionListData);
        const getProfile = await AsyncStorage.getItem("profile");
        setProfile(JSON.parse(getProfile));
      } catch (e) {
        Alert.alert(e.message);
      }
    })();
  }, []);

  const lookup = useCallback((q) => {
    setQuery(q);
  }, []);

  const debouncedLookup = useMemo(() => debounce(lookup, 1000), [lookup]);

  const handleSearchChange = (text) => {
    setSearchBarText(text);
    debouncedLookup(text);
  };

  // FONTS
  const [fontsLoaded] = useFonts({
    "Karla-Regular": require("../assets/fonts/Karla-Regular.ttf"),
    "Karla-Medium": require("../assets/fonts/Karla-Medium.ttf"),
    "Karla-Bold": require("../assets/fonts/Karla-Bold.ttf"),
    "Karla-ExtraBold": require("../assets/fonts/Karla-ExtraBold.ttf"),
    "MarkaziText-Regular": require("../assets/fonts/MarkaziText-Regular.ttf"),
    "MarkaziText-Medium": require("../assets/fonts/MarkaziText-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={require("../img/helping_hand.png")}
          accessible={true}
          accessibilityLabel={"Little Lemon Logo"}
        />
        <Pressable
          style={styles.avatar}
          onPress={() => navigation.navigate("Profile")}
        >
          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarEmpty}>
              <Text style={styles.avatarEmptyText}>
                {profile.firstName && Array.from(profile.firstName)[0]}
                {profile.lastName && Array.from(profile.lastName)[0]}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
      <View style={styles.heroSection}>
        <Text style={styles.heroHeader}>Helping Hand</Text>
        <View style={styles.heroBody}>
          <View style={styles.heroContent}>
            <Text style={styles.heroText}>
            Your help and social integration app in Brazil
            </Text>
          </View>
        </View>
        <Searchbar
          placeholder="Search"
          placeholderTextColor="#333333"
          onChangeText={handleSearchChange}
          value={searchBarText}
          style={styles.searchBar}
          iconColor="#333333"
          inputStyle={{ color: "#333333" }}
          elevation={0}
        />
      </View>
      <Text style={styles.delivery}>Modules</Text>
      <SectionList
        style={styles.sectionList}
        sections={data}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Item
            name={item.name}
            description={item.description}
            image={item.image}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.itemHeader}>{title}</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#f4ce14",
  },
  logo: {
    height: 50,
    width: 400,
    resizeMode: "center",
  },
  sectionList: {
    paddingHorizontal: 16,
  },
  searchBar: {
    marginTop: 15,
    marginBottom:20,
    backgroundColor: "#e4e4e4",
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    paddingVertical: 10,
  },
  itemBody: {
    flex: 1,
    paddingLeft: 10,
  },
  itemHeader: {
    fontSize: 24,
    paddingVertical: 8,
    color: "#495e57",
    backgroundColor: "#fff",
    fontFamily: "Karla-ExtraBold",
  },
  name: {
    fontSize: 20,
    color: "#000000",
    paddingBottom: 5,
    fontFamily: "Karla-Bold",
  },
  description: {
    color: "#333333",
    fontFamily: "Karla-Regular",
  },
  heroSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f4ce14",
  },
  heroHeader: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    paddingVertical: 15,
    textAlign: "center",
  },
  heroBody: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroContent: {
    flex: 1,
    padding: 16,
  },
  heroText: {
    fontSize: 16,
    color: "#333333",
  },
  heroHeader2: {
    fontSize: 24,
    color: "#495e57",
    fontFamily: "Karla-Bold",
  },
  heroImage: {
    height: 200,
    width: 150,
    resizeMode: "cover",
  },
  delivery: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  avatar: {
    marginLeft: "auto",
    marginRight: 16,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarEmpty: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#cccccc",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmptyText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});

