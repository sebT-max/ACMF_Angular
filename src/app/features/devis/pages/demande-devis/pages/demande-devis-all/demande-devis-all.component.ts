import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemandeDevisService } from '../../services/demande-devis.services';
import { DemandeDevisModel } from '../../models/DemandeDevisModel';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-demande-devis-all',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demande-devis-all.component.html',
  styleUrl: './demande-devis-all.component.scss'
})
export class DemandeDevisAllComponent implements OnInit {
  demandesDevis: DemandeDevisModel[] = [];
  filteredDemands: DemandeDevisModel[] = [];
  paginatedDemandeDevis: DemandeDevisModel[] = [];

  searchTerm = '';
  pageSize = 3;
  currentPage = 1;

  constructor(
    private demandeService: DemandeDevisService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.demandeService.getAllDemandeDevis().subscribe({
      next: (data) => {
        this.demandesDevis = data;
        this.applyFilters();
      },
      error: (err) => console.error('Erreur chargement:', err)
    });
  }

  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchTerm: this.searchTerm || null },
      queryParamsHandling: 'merge',
    });
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchTerm: null },
      queryParamsHandling: 'merge',
    });
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredDemands = this.demandesDevis.filter((d) =>
      [d.entrepriseName, d.entrepriseMail, d.contactFirstName, d.contactLastName, d.entrepriseTelephone, d.message, d.numberOfInterns?.toString()]
        .some(field => field?.toLowerCase().includes(term))
    );

    this.filteredDemands = this.filteredDemands.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    this.currentPage = 1;
    this.paginate();
  }

  paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedDemandeDevis = this.filteredDemands.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

  canGoPrev(): boolean {
    return this.currentPage > 1;
  }

  canGoNext(): boolean {
    return this.currentPage < this.totalPages();
  }

  totalPages(): number {
    return Math.ceil(this.filteredDemands.length / this.pageSize);
  }
}
