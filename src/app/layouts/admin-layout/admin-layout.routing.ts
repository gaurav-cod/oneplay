import { Routes } from '@angular/router';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { StoreComponent } from 'src/app/pages/store/store.component';
import { ViewComponent } from 'src/app/pages/view/view.component';
import { StreamComponent } from 'src/app/pages/stream/stream.component';
import { StreamsComponent } from 'src/app/pages/streams/streams.component';
import { LibraryComponent } from 'src/app/pages/library/library.component';
import { SearchComponent } from 'src/app/pages/search/search.component';
import { WishlistComponent } from 'src/app/pages/wishlist/wishlist.component';
import { PlayComponent } from 'src/app//pages/play/play.component';
import { ViewGuard } from 'src/app/guards/view.guard';
import { FeedbackComponent } from 'src/app/pages/feedback/feedback.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'settings/:tab',        component: UserProfileComponent },
    { path: 'home',                 component: HomeComponent },
    { path: 'home/:filter',         component: HomeComponent },
    { path: 'store',                component: StoreComponent },
    { path: 'store/:filter',        component: StoreComponent },
    { path: 'view/:id',             component: ViewComponent, canDeactivate: [ViewGuard] },
    { path: 'streams',              component: StreamsComponent },
    { path: 'streams/:id',          component: StreamComponent },
    { path: 'library',              component: LibraryComponent },
    { path: 'wishlist',             component: WishlistComponent },
    { path: 'search',               component: SearchComponent },
    { path: 'search/:tab',          component: SearchComponent },
    { path: 'play',                   component: PlayComponent },
    { path: 'play',                 component: PlayComponent },
    { path: "quit",                 component: FeedbackComponent },
];
