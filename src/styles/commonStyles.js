// styles/commonStyles.js
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');
const SCAN_GUIDE_SIZE = width * 0.75;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1, backgroundColor: '#FFFDE7' },
  subContainer: { flex: 1, padding: 25 },
  startContainer: { flex: 1 },
  fullGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  mainContent: { flex: 1, alignItems: 'center', marginBottom: 60, justifyContent: 'center', alignItems: 'center' },     // 🔥 가로 중앙},
  centerContent: {
    alignItems: 'center',
    marginTop:50
},
  
  // 🎨 캐릭터
  mascotImage: {
    width: 150,
    height: 150,
    marginBottom: 30,
    borderRadius: 90,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mascotWrapper: {
  alignItems: 'center',
},
  
  brandTitle: { fontSize: 24, letterSpacing: 0, fontWeight: 'bold', color: '#333',marginBottom: 16 },
  teamText: { fontSize: 18, fontWeight: '300', color: '#555', marginTop: 8 },
  divider: { width: 40, height: 1, backgroundColor: '#333', marginVertical: 30 },
  slogan: { fontSize: 15, fontWeight: '300', color: '#666', textAlign: 'center', lineHeight: 28 },
  
  premiumBtn: { 
    paddingHorizontal: 50, 
    paddingVertical: 20, 
    borderWidth: 0.5, 
    borderColor: '#333',
    marginBottom: 40 
  },
  premiumBtnText: { letterSpacing: 5, fontSize: 14, color: '#333' },

  menuContainer: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  menuHeaderWrapper: { marginBottom: 40, alignItems: 'center' },
  menuHeader: { fontSize: 26, fontWeight: '200', color: '#333' },
  headerUnderline: { width: 30, height: 1, backgroundColor: '#333', marginTop: 15 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  menuItem: { 
    width: width * 0.35, 
    height: width * 0.35, 
    backgroundColor: '#fff', 
    margin: 12, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5 
  },
  menuIcon: { fontSize: 38, marginBottom: 10 }, 
  menuLabel: { fontSize: 14, fontWeight: 'bold' },

  camera: { flex: 1 },
  maskOverlay: { ...StyleSheet.absoluteFillObject },
  maskRow: { flexDirection: 'row', height: SCAN_GUIDE_SIZE },
  maskFrameTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  maskFrameBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  maskFrameSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  whiteScanGuide: { 
    width: SCAN_GUIDE_SIZE, 
    height: SCAN_GUIDE_SIZE, 
    borderWidth: 1.5, 
    borderColor: '#fff', 
    borderRadius: SCAN_GUIDE_SIZE/2, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scanGuideTitle: { fontSize: 24, color: '#fff', fontWeight: '100', letterSpacing: 6 },
  scanGuideTeam: { fontSize: 14, color: '#fff', fontWeight: '200', marginTop: 10 },
  scanGuideHint: { fontSize: 11, color: '#FFF59D', marginTop: 15, textAlign: 'center', paddingHorizontal: 40 },

  mapHeader: { fontSize: 22, fontWeight: '200', marginBottom: 25 },
  listScroll: { flex: 1 },
  dataCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15, 
    elevation: 4, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  cardSub: { fontSize: 13, color: '#FF7F50', marginTop: 5 },
  cardActions: { flexDirection: 'row' },
  actionIcon: { fontSize: 22, marginLeft: 15 },
  statusOn: { color: '#4CAF50', fontWeight: 'bold' },
  remindBtn: { backgroundColor: '#F3E5F5', padding: 8, borderRadius: 10 },
  remindText: { fontSize: 12, fontWeight: 'bold' },

  footerContainer: {
  marginTop: 18,
  paddingTop: 10,
  paddingBottom: 10,
  alignItems: 'center',
},
  betaText: {
  fontSize: 12,
  color: '#888',
  marginBottom: 12,
},
  backBtnBottom: { width: '100%' },
  backGradient: {
  paddingVertical: 16,
  paddingHorizontal: 18,
  borderRadius: 18,

  // 가운데 정렬
  alignItems: 'center',
  justifyContent: 'center',

  // 그림자(ios)
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 6,

  // 그림자(android)
  elevation: 4,
},
  backBtnTextBold: {
  color: '#fff',
  fontWeight: '800',
  fontSize: 15,
  letterSpacing: 0.5,
},

  backBtn: { position: 'absolute', top: 60, left: 20 },
  backBtnText: { color: '#fff', fontSize: 16 },
  bottomOverlay: { position: 'absolute', bottom: 80, width: '100%', alignItems: 'center' },
  premiumScanBtn: { 
    backgroundColor: '#FF7F50', 
    paddingHorizontal: 60, 
    paddingVertical: 20, 
    borderRadius: 40,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scanBtnDisabled: {
    backgroundColor: '#BDBDBD',
  },
  premiumScanBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { 
    backgroundColor: '#fff', 
    padding: 30, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    maxHeight: '85%' 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#FF7F50' },
  resultImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 15 },
  scrollContainer: { maxHeight: 300, marginBottom: 15 },
  resultBody: { fontSize: 15, lineHeight: 24, color: '#333' },
  modalCloseBtn: { 
    marginTop: 10, 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#FF7F50', 
    borderRadius: 15 
  },
  modalCloseBtnText: { fontWeight: 'bold', color: '#fff', fontSize: 16 }
  // 
  ,
  modalButtonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 15,
},

modalActionBtn: {
  flex: 1,
  paddingVertical: 15,
  borderRadius: 15,
  alignItems: 'center',
},

secondaryBtn: {
  backgroundColor: '#F3E5F5',
  marginRight: 10,
},

primaryBtn: {
  backgroundColor: '#FF7F50',
  marginLeft: 10,
},

secondaryBtnText: {
  color: '#FF7F50',
  fontWeight: 'bold',
  fontSize: 15,
},

primaryBtnText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 15,
  },
homeFloatingBtn: {
  position: 'absolute',
  top: Platform.OS === 'android' ? 50 : 15,
  right: 16,
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 6,
  zIndex: 999,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
},

homeFloatingIcon: {
  fontSize: 20,
  },
myPillButton: {
  position: 'absolute',
  top: 15,
  right: 20,
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  zIndex: 10,
},

myPillText: {
  fontSize: 13,
  fontWeight: 'bold',
  color: '#FF7F50',
},
  
});