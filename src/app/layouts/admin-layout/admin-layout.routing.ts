import { Routes } from '@angular/router';

import { IconsComponent } from '../../pages/icons/icons.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { StoreComponent } from 'src/app/pages/store/store.component';
import { ViewComponent } from 'src/app/pages/view/view.component';
import { StreamComponent } from 'src/app/pages/stream/stream.component';
import { StreamsComponent } from 'src/app/pages/streams/streams.component';
import { LibraryComponent } from 'src/app/pages/library/library.component';
import { SearchComponent } from 'src/app/pages/search/search.component';
import { WishlistComponent } from 'src/app/pages/wishlist/wishlist.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'user-profile',         component: UserProfileComponent },
    { path: 'user-profile/:tab',    component: UserProfileComponent },
    { path: 'tables',               component: TablesComponent },
    { path: 'icons',                component: IconsComponent },
    { path: 'home',                 component: HomeComponent },
    { path: 'store',                component: StoreComponent },
    { path: 'store/:filter',        component: StoreComponent },
    { path: 'view/:id',             component: ViewComponent },
    { path: 'streams/:id',          component: StreamComponent },
    { path: 'streams',              component: StreamsComponent },
    { path: 'library',              component: LibraryComponent },
    { path: 'search',               component: SearchComponent },
    { path: 'wishlist',             component: WishlistComponent },
    { path: 'search',               component: SearchComponent },
    { path: 'search/:tab',          component: SearchComponent },
];
