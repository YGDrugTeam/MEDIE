import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const H_PADDING = width * 0.05; // 기종 대응
const CARD_RADIUS = 20;
const SCAN_GUIDE_SIZE = Math.min(width * 0.72, 300);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  subContainer: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: 16,
    paddingBottom: 12,
  },

  startContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  fullGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
  },

  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: height * 0.04,
  },

  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  mascotImage: {
    width: Math.min(width * 0.36, 150),
    height: Math.min(width * 0.36, 150),
    marginBottom: 24,
    borderRadius: 999,
    backgroundColor: COLORS.WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },

  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.TEXT_MAIN,
    marginBottom: 12,
    textAlign: 'center',
  },

  teamText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.TEXT_SUB,
    marginTop: 6,
    textAlign: 'center',
  },

  divider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: 24,
  },

  slogan: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.TEXT_SUB,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },

  premiumBtn: {
    width: '100%',
    maxWidth: 320,
    minHeight: 54,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  premiumBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.WHITE,
    letterSpacing: 0.2,
  },

  menuContainer: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: 8,
  },

  menuHeaderWrapper: {
    marginBottom: 24,
    alignItems: 'center',
  },

  menuHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.TEXT_MAIN,
    textAlign: 'center',
  },

  headerUnderline: {
    width: 36,
    height: 3,
    borderRadius: 999,
    backgroundColor: COLORS.PRIMARY,
    marginTop: 12,
  },

  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  menuItem: {
    width: (width - H_PADDING * 2 - 12) / 2,
    minHeight: 140,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    paddingHorizontal: 12,
    paddingVertical: 18,
  },

  menuIcon: {
    fontSize: 34,
    marginBottom: 8,
  },

  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_MAIN,
    textAlign: 'center',
  },

  // Camera
  camera: {
    flex: 1,
  },

  maskOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  maskRow: {
    flexDirection: 'row',
    height: SCAN_GUIDE_SIZE,
  },

  maskFrameTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  maskFrameBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  maskFrameSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  whiteScanGuide: {
    width: SCAN_GUIDE_SIZE,
    height: SCAN_GUIDE_SIZE,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
    borderRadius: SCAN_GUIDE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  scanGuideTitle: {
    fontSize: 22,
    color: COLORS.WHITE,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  scanGuideTeam: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '400',
    marginTop: 8,
  },

  scanGuideHint: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },

  // Common Title
  mapHeader: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: COLORS.TEXT_MAIN,
  },

  listScroll: {
    flex: 1,
  },

  dataCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: CARD_RADIUS,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_MAIN,
  },

  cardSub: {
    fontSize: 13,
    color: COLORS.TEXT_SUB,
    marginTop: 4,
    lineHeight: 18,
  },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    fontSize: 20,
    marginLeft: 14,
  },

  statusOn: {
    color: COLORS.SUCCESS,
    fontWeight: '700',
  },

  remindBtn: {
    backgroundColor: COLORS.SURFACE_SOFT,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },

  remindText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.PRIMARY_DARK,
  },

  // Footer
  footerContainer: {
    marginTop: 14,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
  },

  betaText: {
    fontSize: 12,
    color: COLORS.TEXT_MUTED,
    marginBottom: 10,
    textAlign: 'center',
  },

  backBtnBottom: {
    width: '100%',
  },

  backGradient: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  backBtnTextBold: {
    color: COLORS.WHITE,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 48 : 54,
    left: 20,
    zIndex: 10,
  },

  backBtnText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },

  bottomOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 36,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
  },

  premiumScanBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 24,
    minWidth: width * 0.48,
    maxWidth: 280,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  scanBtnDisabled: {
    backgroundColor: COLORS.TEXT_MUTED,
  },

  premiumScanBtnText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  modalContent: {
    backgroundColor: COLORS.SURFACE,
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: COLORS.TEXT_MAIN,
  },

  resultImage: {
    width: '100%',
    height: Math.min(width * 0.5, 220),
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: COLORS.SURFACE_SOFT,
  },

  scrollContainer: {
    maxHeight: 300,
    marginBottom: 14,
  },

  resultBody: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.TEXT_MAIN,
  },

  modalCloseBtn: {
    marginTop: 10,
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
  },

  modalCloseBtnText: {
    fontWeight: '700',
    color: COLORS.WHITE,
    fontSize: 16,
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  modalActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryBtn: {
    backgroundColor: COLORS.SECONDARY_LIGHT,
    marginRight: 10,
  },

  primaryBtn: {
    backgroundColor: COLORS.PRIMARY,
    marginLeft: 10,
  },

  secondaryBtnText: {
    color: COLORS.PRIMARY_DARK,
    fontWeight: '700',
    fontSize: 15,
  },

  primaryBtnText: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: 15,
  },

  // Floating
  homeFloatingBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 15,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    elevation: 6,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  homeFloatingIcon: {
    fontSize: 20,
  },

  myPillButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 15,
    right: 20,
    backgroundColor: COLORS.SURFACE,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    zIndex: 10,
  },

  myPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.PRIMARY_DARK,
  },
});