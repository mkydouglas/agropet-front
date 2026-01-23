import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendaProdutosComponent } from './venda-produtos.component';

describe('VendaProdutosComponent', () => {
  let component: VendaProdutosComponent;
  let fixture: ComponentFixture<VendaProdutosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendaProdutosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendaProdutosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
