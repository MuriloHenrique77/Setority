import { StyleSheet } from 'react-native';
import { colors, fonts, spacing, radii, touchTarget } from '../theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 12,
  },

  header: {
    marginBottom: spacing.xl,
  },

  title: {
    fontSize: 24,
    fontFamily: fonts.semibold,
    color: colors.text,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  newButton: {
    minHeight: touchTarget,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  newButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontFamily: fonts.semibold,
  },

  listContent: {
    paddingBottom: spacing.xl,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  cardMainArea: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.text,
  },

  cardDescription: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },

  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    gap: 4,
  },

  actionButton: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
  },

  retryButton: {
    minHeight: touchTarget,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 22,
    fontFamily: fonts.semibold,
    color: colors.text,
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  emptyButton: {
    minHeight: touchTarget,
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
});
