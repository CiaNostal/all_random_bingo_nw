{
    const bingo_card_width = 5;
    const bingo_card_height = 5;
    const bingo_card_cell_num = bingo_card_width * bingo_card_height;
    const bingo_card_center_index = Math.floor(bingo_card_width * bingo_card_height / 2); // = 12
    const normal_weapon_img_array = [
        "0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100", // シューター11種類
        "200", "210", "220", "230", "240", "250", //ブラスター6種
        "300", "310", //リール2種
        "400", //ボトル1種
        "1000", "1010", "1020", "1030", "1040", //ローラー5種
        "1100", "1110", //フデ2種
        "2000", "2010", "2030", "2050", "2060", "2070", //チャージャー6種
        "3000", "3010", "3020", "3030", "3040", // スロッシャー5種
        "4000", "4010", "4020", "4030", "4040", // スピナー5種
        "5000", "5010", "5020", "5030", "5040", // マニューバー5種
        "6000", "6010", "6020", //シェルター3種
        "7010", "7020", // ストリンガー2種
        "8000", "8010" // ワイパー2種
    ];
    const normal_weapon_num = normal_weapon_img_array.length - 1;
    const center_str = 'KUMA';

    const storage_key = "salmonrun_all_random_nw"
    let dom = {};
    window.card_holes = [];
    window.bingo_code = undefined;
    window.has_card_created = false;
    window.click_event = 'ontouchend' in window ? 'ontouchend' : 'onclick';
    window.save_variables = [
        'card',
        'card_holes',
        'bingo_code',
        'kuma_weapon',
        "has_card_created"
    ];

    window.onload = () => {
        load_storage();
        let kuma_weapon;
        if (typeof window.kuma_weapon === 'undefined') {
            kuma_weapon = "9000";
        } else {
            kuma_weapon = window.kuma_weapon;
        }
        console.log(window.card);
        console.log(window.card_holes);
        console.log("kuma_weapon : " + kuma_weapon);
        console.log("bingo_code : " + bingo_code);

        console.log("has_card_created : " + has_card_created);

        document.getElementById('kuma-weapon').value = kuma_weapon;
        dom.bingo_card_table = document.querySelector('.bingo-card-table-wrapper table');
        dom.bingo_card_cells = dom.bingo_card_table.querySelectorAll('td');
        dom.bingo_card_name = document.querySelector('.bingo-card-name');
        dom.create_card_button = document.querySelector('.create-card-button');
        for (let i = 0; i < bingo_card_cell_num; i++) {
            dom.bingo_card_cells[i].setAttribute('cell-index', i);
            dom.bingo_card_cells[i][click_event] = cell_click;
        }
        dom.create_card_button[click_event] = create_card_button_click;

        if (!has_card_created) {
            return
        };
        render_card(card);
        for (let i = 0; i < card.length; i++) {
            if (window.card_holes[i]) {
                dom.bingo_card_cells[i].classList.add('hole');
            }
        };
        save_storage();
    };

    /*
     * create_card_button_click()
     */
    function create_card_button_click() {
        console.log('init bingo card');

        bingo_code = new Date().getTime(); //bingo生成のためのシード値
        console.log("bingo_code : " + bingo_code);

        let xors = new Xors(bingo_code);
        card_holes = []; // holesは空(= 全false)

        card = create_card(xors);
        for (let i = 0; i < bingo_card_cell_num; i++) {
            dom.bingo_card_cells[i].classList.remove('hole');
        };

        render_card(card);

        has_card_created = true;
        save_storage();
    };

    /* 
 * create_card()
 */
    function create_card(xors) {
        //cardに入る可能性のあるブキをweaponsとしてプールしておく
        let weapons = [];
        for (let i = 0; i <= normal_weapon_num; i++) {
            weapons.push(i);
        };
        let new_card = [];
        for (let i = 0; i < bingo_card_cell_num; i++) {
            //weaponsから1つ選びだしたら(weapon)、そのブキをweaponsから削除する。
            //同じことを繰り返す
            let r = Math.floor(xors.random() * weapons.length);
            let weapon = weapons[r];
            weapons.splice(r, 1);
            new_card[i] = weapon;
        };
        dom.bingo_card_cells[bingo_card_center_index].classList.add('kuma');
        new_card[bingo_card_center_index] = center_str;
        return new_card;
    };


    /* 
     * render_card(_card)
     */
    function render_card(_card) {
        for (let i = 0; i < _card.length; i++) {
            let str = _card[i];
            // 削除
            dom.bingo_card_cells[i].querySelectorAll('*').forEach(n => n.remove());
            let img_element = document.createElement('img');
            img_element.src = "./weapons_nw/" + normal_weapon_img_array[Number(str)] + ".png";
            img_element.width = 80;
            if (str == center_str) {
                kuma_weapon = document.getElementById("kuma-weapon").value;
                img_element.src = "./weapons_nw/" + kuma_weapon + ".png";
            };
            dom.bingo_card_cells[i].appendChild(img_element);
        };
    };


    /* 
     * cell_click()
     */
    function cell_click() {
        if (!has_card_created) {
            return;
        }
        let cell_index = parseInt(this.getAttribute('cell-index'));
        console.log("click #" + cell_index);
        let is_hole = card_holes[cell_index];
        if (!is_hole) {
            card_holes[cell_index] = true;
            this.classList.add('hole');
        } else {
            card_holes[cell_index] = false;
            this.classList.remove('hole');
        };
        save_storage();
    };

    /* 
     * save_storage()
     */
    function save_storage() {
        console.log(card);
        console.log(card_holes);

        let save_data_obj = {};
        window.save_variables.map(var_name => {
            save_data_obj[var_name] = window[var_name];
        });
        let json_str = JSON.stringify(save_data_obj);
        //console.log(json_str);
        localStorage.setItem(storage_key, json_str);
        console.log('-- save variables');
    };

    /* 
     * load_storage()
     */
    function load_storage() {
        let json_str = localStorage.getItem(storage_key);
        if (json_str !== null) {
            console.log('-- storage data exist');
            console.log('-- merging storage variables to window');
            //console.log(json_str);
            let save_data_obj = JSON.parse(json_str);
            window.save_variables.map(var_name => {
                if (typeof save_data_obj[var_name] !== 'undefined') {
                    window[var_name] = save_data_obj[var_name];
                };
            });
        } else {
            console.log('-- storage data doesn\'t exist');
        };
    };

    /* 
     * get_date_code()
     */
    function get_date_code() {
        let offset_time = new Date().getTime() - 5 * 60 * 60 * 1000;
        let offset_date = new Date(offset_time);
        let str = '' +
            offset_date.getFullYear() +
            (offset_date.getMonth() + 1) +
            offset_date.getDate();
        return parseInt(str);
    };

    /* 
     * Xors(n)
     */
    function Xors(n) {
        let x, y, z, w;
        this.seed = (n) => {
            x = 123456789;
            y = 362436069;
            z = 521288629;
            w = n || 88675123;
        };
        this.random = () => {
            let t;
            t = x ^ (x << 11);
            x = y;
            y = z;
            z = w;
            w = (w ^ (w >> 19)) ^ (t ^ (t >> 8));
            return (w % 1E5) / 1E5;
        };
        this.seed(n);
    };
}