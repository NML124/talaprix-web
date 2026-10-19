import { Service } from '@angular/core';
import { products, proposals, shops } from '../mocks/catalogue';
import { campaigns } from '../mocks/marketing';
import {
  audit,
  invitations,
  members,
  profile,
  sessions,
  users,
} from '../mocks/people';
import {
  actionItems,
  kpis,
  overviewStats,
  savings,
  teamActivity,
  trending,
} from '../mocks/overview';
import type {
  AuditEntry,
  Campaign,
  Member,
  Product,
  Proposal,
  Shop,
  User,
} from '../mocks/models';

const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 160));

/** Frontière de données temporaire : remplacer ces méthodes lors du branchement API. */
@Service()
export class AdminMockApi {
  private readonly productRows = structuredClone(products);
  private readonly campaignRows = structuredClone(campaigns);
  private readonly proposalRows = structuredClone(proposals);
  private readonly shopRows = structuredClone(shops);
  private readonly memberRows = structuredClone(members);
  private readonly userRows = structuredClone(users);
  private readonly auditRows = structuredClone(audit);
  private readonly invitationRows = structuredClone(invitations);

  async getOverview() {
    await pause();
    return structuredClone({
      actions: actionItems,
      kpis,
      stats: overviewStats,
      savings,
      activity: teamActivity,
      trending,
    });
  }

  async listProducts(): Promise<Product[]> {
    await pause();
    return structuredClone(this.productRows);
  }
  async listCampaigns(): Promise<Campaign[]> {
    await pause();
    return structuredClone(this.campaignRows);
  }
  async saveCampaign(campaign: Campaign): Promise<void> {
    await pause();
    const index = this.campaignRows.findIndex((row) => row.id === campaign.id);
    if (index < 0) this.campaignRows.push(structuredClone(campaign));
    else this.campaignRows[index] = structuredClone(campaign);
    this.record('Modification de campagne', campaign.name);
  }
  async deleteCampaign(id: number): Promise<void> {
    await pause();
    const index = this.campaignRows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Campagne introuvable.');
    const [campaign] = this.campaignRows.splice(index, 1);
    this.record('Suppression de campagne', campaign.name);
  }
  async saveProduct(product: Product): Promise<Product> {
    await pause();
    const index = this.productRows.findIndex((row) => row.id === product.id);
    if (index < 0) this.productRows.push(structuredClone(product));
    else this.productRows[index] = structuredClone(product);
    this.record('Modification du produit', product.name);
    return structuredClone(product);
  }
  async deleteProduct(id: number): Promise<void> {
    await pause();
    const index = this.productRows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Produit introuvable.');
    const [product] = this.productRows.splice(index, 1);
    this.record('Suppression du produit', product.name);
  }
  async listProposals(): Promise<Proposal[]> {
    await pause();
    return structuredClone(this.proposalRows);
  }
  async decideProposal(
    id: number,
    decision: 'validée' | 'rejetée',
    reason: string,
  ): Promise<void> {
    await pause();
    if (decision === 'rejetée' && !reason.trim())
      throw new Error('La justification est obligatoire pour rejeter.');
    const index = this.proposalRows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Cette proposition n’est plus disponible.');
    const [proposal] = this.proposalRows.splice(index, 1);
    this.record(
      `Proposition ${decision}`,
      `${proposal.product} · ${proposal.shop}`,
    );
  }
  async listShops(): Promise<Shop[]> {
    await pause();
    return structuredClone(this.shopRows);
  }
  async saveShop(shop: Shop): Promise<Shop> {
    await pause();
    const index = this.shopRows.findIndex((row) => row.id === shop.id);
    const previousName = index >= 0 ? this.shopRows[index].name : null;
    if (index < 0) this.shopRows.push(structuredClone(shop));
    else this.shopRows[index] = structuredClone(shop);
    if (previousName && previousName !== shop.name) {
      for (const product of this.productRows) {
        if (product.shop === previousName) product.shop = shop.name;
      }
    }
    this.record('Modification de la boutique', shop.name);
    return structuredClone(shop);
  }
  async deleteShop(id: number): Promise<void> {
    await pause();
    const index = this.shopRows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Boutique introuvable.');
    const [shop] = this.shopRows.splice(index, 1);
    for (const product of this.productRows) {
      if (product.shop === shop.name) product.status = 'Archivé';
    }
    this.record('Suppression de la boutique', shop.name);
  }
  async listUsers(): Promise<User[]> {
    await pause();
    return structuredClone(this.userRows);
  }
  async saveUser(user: User, reason = ''): Promise<void> {
    await pause();
    if (user.status === 'Suspendu' && !reason.trim())
      throw new Error('Indiquez un motif de suspension.');
    const index = this.userRows.findIndex((row) => row.id === user.id);
    if (index >= 0) this.userRows[index] = structuredClone(user);
    this.record(
      user.status === 'Suspendu'
        ? 'Suspension du compte'
        : 'Réactivation du compte',
      `${user.name}${reason ? ` · ${reason}` : ''}`,
    );
  }
  async updateUserProfile(user: User): Promise<void> {
    await pause();
    const index = this.userRows.findIndex((row) => row.id === user.id);
    if (index < 0) throw new Error('Compte introuvable.');
    this.userRows[index] = structuredClone(user);
    this.record('Modification du profil utilisateur', user.name);
  }
  async deleteUser(id: number): Promise<void> {
    await pause();
    const index = this.userRows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Compte introuvable.');
    const [user] = this.userRows.splice(index, 1);
    this.record('Suppression du compte de démonstration', user.name);
  }
  async listMembers(): Promise<Member[]> {
    await pause();
    return structuredClone(this.memberRows);
  }
  async listInvitations() {
    await pause();
    return structuredClone(this.invitationRows);
  }
  async getProfile() {
    await pause();
    return structuredClone({ profile, sessions });
  }
  async saveMember(member: Member): Promise<void> {
    await pause();
    const index = this.memberRows.findIndex((row) => row.id === member.id);
    if (index >= 0) this.memberRows[index] = structuredClone(member);
    this.record(
      'Modification des accès',
      `${member.name} · ${member.role} · ${member.scope}`,
    );
  }
  async listAudit(): Promise<AuditEntry[]> {
    await pause();
    return structuredClone(this.auditRows);
  }
  async recordAction(action: string, detail: string): Promise<void> {
    await pause();
    this.record(action, detail);
  }
  private record(action: string, detail: string): void {
    this.auditRows.unshift({
      id: Date.now(),
      actor: 'Aline Mukendi',
      action,
      detail,
      time: new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Africa/Kinshasa',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
    });
  }
}
